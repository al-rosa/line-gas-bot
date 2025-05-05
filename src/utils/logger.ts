/**
 * Copyright 2025 al-rosa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { SpreadsheetService } from '../services/spreadsheetService';

/**
 * ロガークラス
 */
export class Logger {
  private static instance: Logger;
  private _isDebugMode = false;
  private _isInitialized = false;
  private _spreadsheetService: SpreadsheetService | null = null;

  /**
   * コンストラクタ
   */
  private constructor() {
    // 初期化を遅延させる
  }

  /**
   * シングルトンインスタンスを取得
   * @return {Logger} Loggerインスタンス
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * ロガーの初期化
   * @param {boolean} isDebugMode デバッグモードかどうか
   */
  public initialize(isDebugMode = false): void {
    this._isDebugMode = isDebugMode;
    this._isInitialized = true;
    this._spreadsheetService = SpreadsheetService.getInstance();
  }

  /**
   * デバッグモードを設定
   * @param {boolean} isDebug デバッグモードフラグ
   */
  public setDebugMode(isDebug: boolean): void {
    this._isDebugMode = isDebug;
  }

  /**
   * 情報ログを出力
   * @param {string} message メッセージ
   */
  public log(message: string): void {
    console.log(`[INFO] ${message}`);
    this.saveToSheet('INFO', message);
  }

  /**
   * デバッグログを出力
   * @param {string} message メッセージ
   */
  public debug(message: string): void {
    if (this._isDebugMode) {
      console.log(`[DEBUG] ${message}`);
      this.saveToSheet('DEBUG', message);
    }
  }

  /**
   * 警告ログを出力
   * @param {string} message メッセージ
   */
  public warn(message: string): void {
    console.warn(`[WARN] ${message}`);
    this.saveToSheet('WARN', message);
  }

  /**
   * エラーログを出力
   * @param {string} message メッセージ
   */
  public error(message: string): void {
    console.error(`[ERROR] ${message}`);
    this.saveToSheet('ERROR', message);
  }

  /**
   * スプレッドシートにログを保存
   * @param {string} level ログレベル
   * @param {string} message メッセージ
   */
  private saveToSheet(level: string, message: string): void {
    try {
      // スプレッドシートサービスが初期化されているか確認
      if (this._isInitialized && this._spreadsheetService) {
        this._spreadsheetService.saveLog(level, message);
      }
    } catch (error) {
      // スプレッドシート保存エラーはコンソールのみに出力
      console.error(`Failed to save log to sheet: ${error}`);
    }
  }
}
