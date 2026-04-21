'use client';

import { useEffect, useRef } from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartData[];
  maxValue?: number;
  height?: number;
  animated?: boolean;
}

export function BarChart({ data, maxValue, height = 200, animated = true }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const max = maxValue || Math.max(...data.map(d => d.value));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height - 40;
    const barWidth = (width / data.length) * 0.6;
    const spacing = (width / data.length) * 0.4;

    // 清空画布
    ctx.clearRect(0, 0, width, rect.height);

    // 绘制柱状图
    data.forEach((item, index) => {
      const x = index * (barWidth + spacing) + spacing / 2;
      const barHeight = (item.value / max) * chartHeight;
      const y = chartHeight - barHeight;

      // 动画效果
      const animateHeight = animated ? barHeight * 0 : barHeight;
      
      // 绘制柱子
      const gradient = ctx.createLinearGradient(0, y, 0, chartHeight);
      gradient.addColorStop(0, item.color || '#00ffff');
      gradient.addColorStop(1, item.color ? item.color + '80' : '#00ffff80');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // 绘制数值
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);

      // 绘制标签
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(item.label, x + barWidth / 2, chartHeight + 20);
    });

    // 绘制网格线
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [data, max, animated]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px` }}
      className="rounded-lg"
    />
  );
}

interface LineChartProps {
  data: { x: string; y: number }[];
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 200, color = '#00ffff' }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height - 40;
    const maxY = Math.max(...data.map(d => d.y));
    const minY = Math.min(...data.map(d => d.y));
    const range = maxY - minY || 1;

    ctx.clearRect(0, 0, width, rect.height);

    // 绘制网格
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 绘制折线
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = chartHeight - ((point.y - minY) / range) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制数据点
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = chartHeight - ((point.y - minY) / range) * chartHeight;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // 标签
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.x, x, chartHeight + 15);
    });
  }, [data, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px` }}
      className="rounded-lg"
    />
  );
}

interface PieChartProps {
  data: ChartData[];
  size?: number;
}

export function PieChart({ data, size = 200 }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 20;

    ctx.clearRect(0, 0, size, size);

    let currentAngle = -Math.PI / 2;

    data.forEach(item => {
      const sliceAngle = (item.value / total) * Math.PI * 2;

      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color || '#00ffff';
      ctx.fill();

      // 绘制标签
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#0a1628';
    ctx.fill();

  }, [data, total, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="mx-auto"
    />
  );
}
