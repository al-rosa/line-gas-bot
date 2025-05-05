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
import { Config } from './config/config';
import { EnvConfig } from './config/envConfig';
import { HandlerFactory } from './factories/handlerFactory';
import { LineEvent } from './models/lineEvent';
import { SpreadsheetService } from './services/spreadsheetService';
import { Logger } from './utils/logger';

/**
 * アプリケーション初期化処理
 */
function initialize(): boolean {
  try {
    console.log('Starting application initialization...');

    // 環境変数の初期化
    const env = EnvConfig.getInstance();

    // Configの初期化
    const config = Config.getInstance();

    // SpreadsheetServiceの初期化
    const ss = SpreadsheetService.getInstance();
    const spreadsheetId = config.getUserDataSpreadsheetId();

    if (spreadsheetId) {
      ss.setSpreadsheetId(spreadsheetId);
      console.log(`Spreadsheet ID set: ${spreadsheetId}`);
    } else {
      // スプレッドシートが存在しない場合は作成
      const newId = ss.createSpreadsheet();
      env.set('USER_DATA_SPREADSHEET_ID', newId);
      console.log(`New spreadsheet created with ID: ${newId}`);
    }

    // Loggerの初期化
    const logger = Logger.getInstance();
    logger.initialize(config.isDebugMode());
    logger.log('Logger initialized');

    // 初期化完了フラグの設定
    env.set('APP_INITIALIZED', 'true');

    console.log('Application initialization completed successfully');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Initialization error: ${error.message}`);
    } else {
      console.error(`Unknown initialization error: ${String(error)}`);
    }
    return false;
  }
}

/**
 * LINEからのPOSTリクエストを処理する
 * @param {GoogleAppsScript.Events.DoPost} e リクエストオブジェクト
 */
function doPost(e: GoogleAppsScript.Events.DoPost): void {
  try {
    // まず全てのリクエストデータをログに出力
    console.log('==== Request Details ====');
    console.log('Parameter keys:', Object.keys(e.parameter || {}));
    console.log('All parameters:', JSON.stringify(e.parameter || {}));
    console.log('Content type:', e.postData?.type);
    console.log('Content length:', (e.postData?.contents || '').length);

    // アプリケーションの初期化
    initialize();

    // リクエストからLINEイベントを解析
    const content = e.postData?.contents || '{"events":[]}';
    const data = JSON.parse(content);
    const events = data.events as LineEvent[];

    console.log(`Received ${events.length} events`);

    // 各イベントを処理
    events.forEach((event: LineEvent) => {
      try {
        // ファクトリーパターンでハンドラーを取得
        const handler = HandlerFactory.createHandler(event);
        handler.handle(event);
        console.log(`Handled event: ${JSON.stringify(event)}`);
      } catch (eventError) {
        // 個別イベントのエラーをログに記録するが処理は続行
        if (eventError instanceof Error) {
          console.error(`Error handling event: ${eventError.message}`);
        } else {
          console.error(`Unknown error handling event: ${String(eventError)}`);
        }
      }
    });

    console.log('All events processed successfully');
  } catch (error) {
    // エラーロギング
    if (error instanceof Error) {
      console.error(`Error in doPost: ${error.message}`);
    } else {
      console.error(`Unknown error in doPost: ${String(error)}`);
    }
  }
}

/**
 * GETリクエストを処理する
 * @param {GoogleAppsScript.Events.DoGet} e リクエストオブジェクト
 * @return {GoogleAppsScript.Content.TextOutput} レスポンス
 */
function doGet(): GoogleAppsScript.Content.TextOutput {
  const output = ContentService.createTextOutput(
    JSON.stringify({
      status: 'ok',
      message: 'This is a LINE Webhook endpoint. Please use POST method.',
      version: '1.0.0',
    })
  );
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// 型定義を追加
type DoPostFunction = (e: GoogleAppsScript.Events.DoPost) => void;

// グローバルオブジェクトの型拡張
declare global {
  // Google Apps Script環境では Window ではなく GlobalThis を使用
  interface GlobalThis {
    doPost: DoPostFunction;
  }
}

// グローバルオブジェクトに関数を割り当て
// 拡張された型定義によって any キャストが不要になる
// Explicitly cast globalThis to the extended type
(globalThis as typeof globalThis & { doPost: DoPostFunction }).doPost = doPost;
(
  globalThis as typeof globalThis & {
    doGet: (
      e: GoogleAppsScript.Events.DoGet
    ) => GoogleAppsScript.Content.TextOutput;
  }
).doGet = doGet;
