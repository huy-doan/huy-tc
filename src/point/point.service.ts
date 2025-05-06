import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Point, PointStatus, PointType, TrendType } from './entities/point.entity';
import { PointTF } from './entities/point-tf.entity';
import { upFibonacciRetracement, downFibonacciRetracement, downFibonacciExtention, upFibonacciExtention } from '~helpers/formula.helper';
import { CustomCandle, ChartResult } from '~interfaces/common.interface';
import { HARMONICS } from '~config/harmonics.config';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private pointRepository: Repository<Point>,
    @InjectRepository(PointTF)
    private pointTFRepository: Repository<PointTF>,
  ) {}

  /**
   * Lưu điểm C hoặc D vào database
   */
  async savePoint(
    chartResult: ChartResult,
    symbol: string,
    interval: string,
    patternType: string,
    isBullish: boolean,
    pointType: PointType,
  ): Promise<Point> {
    const point = this.pointRepository.create({
      symbol,
      interval,
      pattern_type: patternType,
      trend_type: isBullish ? TrendType.BULLISH : TrendType.BEARISH,
      point_type: pointType,
      price: pointType === PointType.C 
        ? (isBullish ? chartResult.cPrice.highNum : chartResult.cPrice.lowNum)
        : (isBullish ? chartResult.dPrices[0].lowNum : chartResult.dPrices[0].highNum),
      open_time: pointType === PointType.C 
        ? chartResult.cPrice.openTime
        : chartResult.dPrices[0].openTime,
      index: pointType === PointType.C 
        ? chartResult.cPrice.index
        : chartResult.dPrices[0].index,
      status: pointType === PointType.C ? PointStatus.PROCESSING : PointStatus.COMPLETED,
      x_price_id: chartResult.xPrice.index,
      a_price_id: chartResult.aPrice.index,
      b_price_id: chartResult.bPrice.index,
    });

    const savedPoint = await this.pointRepository.save(point);

    // Nếu là điểm C, dự đoán D và tính toán TPs
    if (pointType === PointType.C) {
      await this.createPredictionAndTPs(savedPoint, chartResult, patternType, isBullish);
    } else {
      // Nếu là điểm D, tính toán TPs
      await this.createPointTF(savedPoint, chartResult, patternType, isBullish);
    }

    return savedPoint;
  }

  /**
   * Dự đoán điểm D và tính toán TPs khi chỉ có điểm C
   */
  private async createPredictionAndTPs(
    point: Point,
    chartResult: ChartResult,
    patternType: string,
    isBullish: boolean,
  ) {
    const patternLevels = HARMONICS.PATTERNS[patternType as keyof typeof HARMONICS.PATTERNS];
    let predictedDPrice: number;

    // Dự đoán điểm D dựa vào mô hình
    if (['BUTTERFLY', 'CRAB'].includes(patternType)) {
      predictedDPrice = isBullish
        ? upFibonacciRetracement(chartResult.xPrice.lowNum, chartResult.aPrice.highNum, patternLevels.D_MIN)
        : downFibonacciRetracement(chartResult.xPrice.highNum, chartResult.aPrice.lowNum, patternLevels.D_MIN);
    } else {
      predictedDPrice = isBullish
        ? upFibonacciRetracement(chartResult.xPrice.lowNum, chartResult.cPrice.highNum, patternLevels.D_MIN)
        : downFibonacciRetracement(chartResult.cPrice.lowNum, chartResult.xPrice.highNum, patternLevels.D_MIN);
    }

    // Cập nhật dự đoán D vào điểm
    point.d_predicted_price = predictedDPrice;
    await this.pointRepository.save(point);

    // Tạo point_tf với điểm D dự đoán
    await this.createPointTFWithPrediction(point, chartResult, predictedDPrice, patternType, isBullish);
  }

  /**
   * Tạo thông tin TP và ST cho điểm có D thực
   */
  private async createPointTF(
    point: Point,
    chartResult: ChartResult,
    patternType: string,
    isBullish: boolean,
  ) {
    const dPrice = isBullish ? chartResult.dPrices[0].lowNum : chartResult.dPrices[0].highNum;
    
    const pointTF = this.pointTFRepository.create({
      point_id: point.id,
      x_price: isBullish ? chartResult.xPrice.lowNum : chartResult.xPrice.highNum,
      a_price: isBullish ? chartResult.aPrice.highNum : chartResult.aPrice.lowNum,
      b_price: isBullish ? chartResult.bPrice.lowNum : chartResult.bPrice.highNum,
      c_price: isBullish ? chartResult.cPrice.highNum : chartResult.cPrice.lowNum,
      d_price: dPrice,
      ...this.calculateTPsAndST(chartResult, patternType, isBullish, dPrice),
    });

    await this.pointTFRepository.save(pointTF);
  }

  /**
   * Tạo thông tin TP và ST với D dự đoán
   */
  private async createPointTFWithPrediction(
    point: Point,
    chartResult: ChartResult,
    predictedDPrice: number,
    patternType: string,
    isBullish: boolean,
  ) {
    const pointTF = this.pointTFRepository.create({
      point_id: point.id,
      x_price: isBullish ? chartResult.xPrice.lowNum : chartResult.xPrice.highNum,
      a_price: isBullish ? chartResult.aPrice.highNum : chartResult.aPrice.lowNum,
      b_price: isBullish ? chartResult.bPrice.lowNum : chartResult.bPrice.highNum,
      c_price: isBullish ? chartResult.cPrice.highNum : chartResult.cPrice.lowNum,
      d_price: predictedDPrice,
      ...this.calculateTPsAndST(chartResult, patternType, isBullish, predictedDPrice),
    });

    await this.pointTFRepository.save(pointTF);
  }

  /**
   * Tính toán Take Profit và Stop Loss
   */
  private calculateTPsAndST(
    chartResult: ChartResult,
    patternType: string,
    isBullish: boolean,
    dPrice: number,
  ) {
    const xPrice = isBullish ? chartResult.xPrice.lowNum : chartResult.xPrice.highNum;
    const aPrice = isBullish ? chartResult.aPrice.highNum : chartResult.aPrice.lowNum;
    
    // Tính toán TP theo tỉ lệ Fibonacci
    const tp1Level = 0.382; // 38.2% retracement
    const tp2Level = 0.618; // 61.8% retracement  
    const tp3Level = 0.786; // 78.6% retracement

    let tp1, tp2, tp3;

    if (isBullish) {
      // Bullish pattern: D là điểm thấp nhất, TP đi lên
      tp1 = upFibonacciRetracement(dPrice, aPrice, tp1Level);
      tp2 = upFibonacciRetracement(dPrice, aPrice, tp2Level);
      tp3 = upFibonacciRetracement(dPrice, aPrice, tp3Level);
    } else {
      // Bearish pattern: D là điểm cao nhất, TP đi xuống
      tp1 = downFibonacciRetracement(dPrice, aPrice, tp1Level);
      tp2 = downFibonacciRetracement(dPrice, aPrice, tp2Level);
      tp3 = downFibonacciRetracement(dPrice, aPrice, tp3Level);
    }

    const stPrice = xPrice > dPrice ? xPrice : dPrice;

    return {
      tp1_price: tp1,
      tp2_price: tp2,
      tp3_price: tp3,
      st_price: stPrice,
      tp1_fibonacci_level: tp1Level,
      tp2_fibonacci_level: tp2Level,
      tp3_fibonacci_level: tp3Level,
    };
  }

  /**
   * Cập nhật trạng thái điểm khi hit TP hoặc ST
   */
  async updatePointStatus(pointId: number, newStatus: PointStatus) {
    await this.pointRepository.update(pointId, { status: newStatus });
  }

  /**
   * Lấy các điểm cần kiểm tra (status: 1,2,3,4)
   */
  async getPointsToCheck(): Promise<Point[]> {
    return this.pointRepository.find({
      where: {
        status: In([PointStatus.PROCESSING, PointStatus.COMPLETED, PointStatus.TP1, PointStatus.TP2]),
      },
      relations: ['point_tfs'],
    });
  }

  /**
   * Kiểm tra và cập nhật trạng thái điểm dựa trên giá hiện tại
   */
  async checkAndUpdatePoint(point: Point, currentCandle: CustomCandle) {
    const pointTF = point.point_tfs[0];
    if (!pointTF) return;

    const currentPrice = currentCandle.closeNum;
    const isBullish = point.trend_type === TrendType.BULLISH;

    // Kiểm tra ST trước
    if (isBullish) {
      if (currentPrice <= pointTF.st_price) {
        await this.updatePointStatus(point.id, PointStatus.ST);
        return;
      }
    } else {
      if (currentPrice >= pointTF.st_price) {
        await this.updatePointStatus(point.id, PointStatus.ST);
        return;
      }
    }

    // Kiểm tra TPs
    switch (point.status) {
      case PointStatus.PROCESSING:
      case PointStatus.COMPLETED:
        if (this.checkTPHit(currentPrice, pointTF.tp1_price, isBullish)) {
          await this.updatePointStatus(point.id, PointStatus.TP1);
        }
        break;
      case PointStatus.TP1:
        if (this.checkTPHit(currentPrice, pointTF.tp2_price, isBullish)) {
          await this.updatePointStatus(point.id, PointStatus.TP2);
        }
        break;
      case PointStatus.TP2:
        if (this.checkTPHit(currentPrice, pointTF.tp3_price, isBullish)) {
          await this.updatePointStatus(point.id, PointStatus.TP3);
        }
        break;
    }
  }

  /**
   * Kiểm tra TP đã bị hit chưa
   */
  private checkTPHit(currentPrice: number, tpPrice: number, isBullish: boolean): boolean {
    if (isBullish) {
      return currentPrice >= tpPrice; // Bullish: giá di chuyển lên hit TP
    } else {
      return currentPrice <= tpPrice; // Bearish: giá di chuyển xuống hit TP
    }
  }
}
