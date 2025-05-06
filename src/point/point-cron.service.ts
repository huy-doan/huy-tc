import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PointService } from './point.service';
import { BinanceService } from '../binances/binance.service';
import { CustomCandle } from '~interfaces/common.interface';

@Injectable()
export class PointCronService {
  constructor(
    private readonly pointService: PointService,
    private readonly binanceService: BinanceService,
  ) {}

  /**
   * Chạy mỗi phút để kiểm tra và cập nhật trạng thái điểm
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkPoints() {
    try {
      console.log('Checking points...');
      
      // Lấy các điểm cần kiểm tra
      const points = await this.pointService.getPointsToCheck();
      
      // Nhóm điểm theo symbol và interval để tối ưu việc lấy dữ liệu
      const groupedPoints = this.groupPointsBySymbolAndInterval(points);
      
      // Kiểm tra và cập nhật mỗi nhóm
      for (const [symbolInterval, pointsGroup] of groupedPoints.entries()) {
        const [symbol, interval] = symbolInterval.split('|');
        
        try {
          // Lấy dữ liệu nến hiện tại
          const currentCandles = await this.binanceService.getFuturesCandles({
            symbol,
            interval: interval as any,
            limit: 1,
          });
          
          if (currentCandles.length > 0) {
            const currentCandle = currentCandles[0];
            
            // Kiểm tra và cập nhật từng điểm
            for (const point of pointsGroup) {
              await this.pointService.checkAndUpdatePoint(point, currentCandle);
            }
          }
        } catch (error) {
          console.error(`Error checking points for ${symbol} ${interval}:`, error);
        }
      }
      
      console.log('Points check completed');
    } catch (error) {
      console.error('Error in points cron job:', error);
    }
  }

  /**
   * Nhóm điểm theo symbol và interval
   */
  private groupPointsBySymbolAndInterval(points: any[]) {
    const grouped = new Map();
    
    for (const point of points) {
      const key = `${point.symbol}|${point.interval}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(point);
    }
    
    return grouped;
  }
}
