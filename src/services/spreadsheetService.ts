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
import { MessageRow } from '../models/message';
import { UserRow } from '../models/user';

/**
 * シート情報インターフェース
 */
interface SheetConfig {
  name: string;
  headers: string[];
  formatColumns: number;
}

/**
 * スプレッドシートサービスクラス
 */
export class SpreadsheetService {
  private static instance: SpreadsheetService;
  private spreadsheetId: string | null = null;

  // シート設定
  private readonly sheetConfigs: Record<string, SheetConfig> = {
    Users: {
      name: 'Users',
      headers: [
        'userId',
        'displayName',
        'state',
        'data',
        'createdAt',
        'updatedAt',
      ],
      formatColumns: 6,
    },
    Messages: {
      name: 'Messages',
      headers: ['userId', 'type', 'content', 'timestamp'],
      formatColumns: 4,
    },
    Logs: {
      name: 'Logs',
      headers: ['timestamp', 'level', 'message'],
      formatColumns: 3,
    },
  };

  /**
   * コンストラクタ
   */
  private constructor() {
    // 初期化を遅延させる
  }

  /**
   * シングルトンインスタンスを取得
   * @return {SpreadsheetService} SpreadsheetServiceインスタンス
   */
  public static getInstance(): SpreadsheetService {
    if (!SpreadsheetService.instance) {
      SpreadsheetService.instance = new SpreadsheetService();
    }
    return SpreadsheetService.instance;
  }

  /**
   * スプレッドシートIDを設定
   * @param {string} id スプレッドシートID
   */
  public setSpreadsheetId(id: string): void {
    this.spreadsheetId = id;
  }

  /**
   * スプレッドシートの作成
   * @return {string} 作成されたスプレッドシートID
   */
  public createSpreadsheet(): string {
    try {
      // スプレッドシート作成
      const ss = SpreadsheetApp.create('line-gas-bot');
      this.spreadsheetId = ss.getId();

      // スクリプトプロパティに保存
      PropertiesService.getScriptProperties().setProperty(
        'USER_DATA_SPREADSHEET_ID',
        this.spreadsheetId
      );

      // シート作成
      this.initializeSheets();

      console.log(`Created new spreadsheet: ${this.spreadsheetId}`);
      return this.spreadsheetId;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Create spreadsheet error: ${error.message}`);
      } else {
        console.error(`Unknown create spreadsheet error: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * シートの初期化
   */
  public initializeSheets(): void {
    try {
      const ss = this.getSpreadsheet();

      // 各シートを初期化
      Object.values(this.sheetConfigs).forEach(config => {
        this.ensureSheetExists(ss, config);
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Initialize sheets error: ${error.message}`);
      } else {
        console.error(`Unknown initialize sheets error: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * シートが存在することを確認し、なければ作成
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss スプレッドシート
   * @param {SheetConfig} config シート設定
   * @return {GoogleAppsScript.Spreadsheet.Sheet} シートオブジェクト
   */
  private ensureSheetExists(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    config: SheetConfig
  ): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = ss.getSheetByName(config.name);

    if (!sheet) {
      console.log(`${config.name} sheet not found, creating a new one...`);
      sheet = ss.insertSheet(config.name);
      sheet.appendRow(config.headers);
      sheet.setFrozenRows(1);

      // ヘッダー行の書式設定
      sheet
        .getRange(1, 1, 1, config.formatColumns)
        .setBackground('#f3f3f3')
        .setFontWeight('bold');

      console.log(`${config.name} sheet created successfully`);
    }

    return sheet;
  }

  /**
   * スプレッドシートを取得
   * @return {GoogleAppsScript.Spreadsheet.Spreadsheet} スプレッドシートオブジェクト
   */
  private getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    if (!this.spreadsheetId) {
      throw new Error('Spreadsheet ID is not set');
    }
    return SpreadsheetApp.openById(this.spreadsheetId);
  }

  /**
   * ユーザーデータを保存
   * @param {UserRow} userData ユーザーデータ配列
   */
  public saveUserData(userData: UserRow): void {
    try {
      const ss = this.getSpreadsheet();
      const sheet = this.ensureSheetExists(ss, this.sheetConfigs.Users);

      const userId = userData[0];
      const existingRow = this.findUserRow(sheet, userId);

      if (existingRow > 0) {
        // 既存ユーザーの更新
        // updatedAtが含まれていなければ追加
        if (userData.length <= 5) {
          userData.push(new Date()); // updatedAt
        }
        const range = sheet.getRange(existingRow, 1, 1, userData.length);
        range.setValues([userData]);
      } else {
        // 新規ユーザーの追加
        // updatedAtが含まれていなければ追加
        if (userData.length <= 5) {
          userData.push(new Date()); // updatedAt
        }
        sheet.appendRow(userData);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error saving user data: ${error.message}`);
      } else {
        console.error(`Unknown error saving user data: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * ユーザーIDでユーザー行を検索
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet シートオブジェクト
   * @param {string} userId ユーザーID
   * @return {number} 行番号（0なら未検出）
   */
  private findUserRow(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    userId: string
  ): number {
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === userId) {
        return i + 1; // 行番号は1から始まる
      }
    }

    return 0;
  }

  /**
   * ユーザーIDでユーザーデータを取得
   * @param {string} userId ユーザーID
   * @return {UserRow|null} ユーザーデータ配列またはnull
   */
  public getUserDataByUserId(userId: string): UserRow | null {
    try {
      const ss = this.getSpreadsheet();
      const sheet = this.ensureSheetExists(ss, this.sheetConfigs.Users);

      const row = this.findUserRow(sheet, userId);

      if (row > 0) {
        const range = sheet.getRange(
          row,
          1,
          1,
          this.sheetConfigs.Users.formatColumns
        );
        const values = range.getValues();
        return values[0] as UserRow;
      }

      return null;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error getting user data: ${error.message}`);
      } else {
        console.error(`Unknown error getting user data: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * メッセージデータを保存
   * @param {MessageRow} messageData メッセージデータ配列
   */
  public saveMessageData(messageData: MessageRow): void {
    try {
      const ss = this.getSpreadsheet();
      const sheet = this.ensureSheetExists(ss, this.sheetConfigs.Messages);
      sheet.appendRow(messageData);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error saving message data: ${error.message}`);
      } else {
        console.error(`Unknown error saving message data: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * ユーザーIDでメッセージを取得
   * @param {string} userId ユーザーID
   * @param {number} limit 取得件数上限
   * @return {MessageRow[]} メッセージデータ配列
   */
  public getMessagesByUserId(userId: string, limit = 10): MessageRow[] {
    try {
      const ss = this.getSpreadsheet();
      const sheet = this.ensureSheetExists(ss, this.sheetConfigs.Messages);

      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();

      // ヘッダー行をスキップして、userIdが一致するものを取得
      const messages = values
        .slice(1)
        .filter(row => row[0] === userId) as MessageRow[];

      // 新しい順に並べ替え
      messages.sort((a, b) => {
        const dateA = a[3] instanceof Date ? a[3] : new Date(String(a[3]));
        const dateB = b[3] instanceof Date ? b[3] : new Date(String(b[3]));
        return dateB.getTime() - dateA.getTime();
      });

      // 件数制限
      return messages.slice(0, limit);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error getting messages: ${error.message}`);
      } else {
        console.error(`Unknown error getting messages: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * ログを保存
   * @param {string} level ログレベル
   * @param {string} message メッセージ
   */
  public saveLog(level: string, message: string): void {
    try {
      if (!this.spreadsheetId) {
        // スプレッドシートIDがまだ設定されていない場合は保存を無視
        return;
      }

      const ss = this.getSpreadsheet();
      const sheet = this.ensureSheetExists(ss, this.sheetConfigs.Logs);
      sheet.appendRow([new Date(), level, message]);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to save log to sheet: ${error.message}`);
      } else {
        console.error(`Unknown error saving log: ${String(error)}`);
      }
      // ログ機能のエラーは致命的ではないため、例外をスローしない
    }
  }
}
