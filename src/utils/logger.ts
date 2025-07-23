// src/utils/logger.ts

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'component' | 'hook' | 'api' | 'page' | 'style' | 'state';

interface LogEntry {
  stack: string;
  level: LogLevel;
  package: LogPackage;
  message: string;
  timestamp?: string;
}

class Logger {
  private readonly LOGGING_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';
  private readonly STACK = 'frontend';

  private readonly ACCESS_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyYW1kYXNzYXJheXUyMkBpZmhlaW5kaWEub3JnIiwiZXhwIjoxNzUzMjUyMDc4LCJpYXQiOjE3NTMyNTExNzgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIyNjBhMzA0My1jYjkwLTQ0NDgtODA5Ny1jMzhmN2FiY2YzNGYiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzYXJheXUgcmFtZGFzIiwic3ViIjoiN2ZhYmM2ZDMtZmI2YS00Mjc3LTlkMWQtMDQ3YTA1NzdlNmEzIn0sImVtYWlsIjoicmFtZGFzc2FyYXl1MjJAaWZoZWluZGlhLm9yZyIsIm5hbWUiOiJzYXJheXUgcmFtZGFzIiwicm9sbE5vIjoiMjJzdHVjaGgwMTAxOTUiLCJhY2Nlc3NDb2RlIjoiYkN1Q0ZUIiwiY2xpZW50SUQiOiI3ZmFiYzZkMy1mYjZhLTQyNzctOWQxZC0wNDdhMDU3N2U2YTMiLCJjbGllbnRTZWNyZXQiOiJGU0dCc2RaWEpnRmtCcnZBIn0.oEAIMYK6aDP9AP4LZQhheBq5yN0yURFQDN9i1Bx4_3Y';

  private async sendLog(entry: LogEntry): Promise<void> {
    try {
      const logData = {
        ...entry,
        stack: this.STACK,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(this.LOGGING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🚫 Logging failed: ${response.status} - ${errorText}`);
      } else {
        const resData = await response.json();
        console.log('✅ Log sent:', resData);
      }
    } catch (error) {
      console.error('❌ Network/logging error:', error);
    }
  }

  debug(packageName: LogPackage, message: string): void {
    this.sendLog({ stack: this.STACK, level: 'debug', package: packageName, message });
  }

  info(packageName: LogPackage, message: string): void {
    this.sendLog({ stack: this.STACK, level: 'info', package: packageName, message });
  }

  warn(packageName: LogPackage, message: string): void {
    this.sendLog({ stack: this.STACK, level: 'warn', package: packageName, message });
  }

  error(packageName: LogPackage, message: string): void {
    this.sendLog({ stack: this.STACK, level: 'error', package: packageName, message });
  }

  fatal(packageName: LogPackage, message: string): void {
    this.sendLog({ stack: this.STACK, level: 'fatal', package: packageName, message });
  }
}

export const logger = new Logger();

export const log = {
  debug: (packageName: LogPackage, message: string) => logger.debug(packageName, message),
  info: (packageName: LogPackage, message: string) => logger.info(packageName, message),
  warn: (packageName: LogPackage, message: string) => logger.warn(packageName, message),
  error: (packageName: LogPackage, message: string) => logger.error(packageName, message),
  fatal: (packageName: LogPackage, message: string) => logger.fatal(packageName, message),
};
