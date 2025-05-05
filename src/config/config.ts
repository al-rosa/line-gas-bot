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
import { EnvConfig } from './envConfig';

/**
 * アプリケーション設定を管理するクラス
 */
export class Config {
  private static instance: Config;
  private _env: EnvConfig | null = null;
  private cache: GoogleAppsScript.Cache.Cache;

  /**
   * コンストラクタ
   */
  private constructor() {
    this.cache = CacheService.getScriptCache();
  }

  /**
   * シングルトンインスタンスを取得
   * @return {Config} Configインスタンス
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * EnvConfigを遅延取得
   */
  private get env(): EnvConfig {
    if (!this._env) {
      this._env = EnvConfig.getInstance();
    }
    return this._env;
  }

  /**
   * LINEチャンネルアクセストークンを取得
   * @return {string} アクセストークン
   */
  public getLineChannelAccessToken(): string {
    return this.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  }

  /**
   * LINEチャンネルシークレットを取得
   * @return {string} チャンネルシークレット
   */
  public getLineChannelSecret(): string {
    return this.env.get('LINE_CHANNEL_SECRET');
  }

  /**
   * ユーザーデータが保存されているスプレッドシートIDを取得
   * @return {string} スプレッドシートID
   */
  public getUserDataSpreadsheetId(): string {
    return this.env.get('USER_DATA_SPREADSHEET_ID');
  }

  /**
   * API Keyを取得
   * @return {string} API Key
   */
  public getApiKey(): string {
    return this.env.get('API_KEY');
  }

  /**
   * デバッグモードかどうか
   * @return {boolean} デバッグモードかどうか
   */
  public isDebugMode(): boolean {
    return this.env.get('DEBUG_MODE') === 'true';
  }

  /**
   * 環境名を取得
   * @return {string} 環境名
   */
  public getEnvironment(): string {
    return this.env.get('NODE_ENV', 'development');
  }

  /**
   * 開発環境かどうか
   * @return {boolean} 開発環境かどうか
   */
  public isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  /**
   * 本番環境かどうか
   * @return {boolean} 本番環境かどうか
   */
  public isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  /**
   * テスト環境かどうか
   * @return {boolean} テスト環境かどうか
   */
  public isTesting(): boolean {
    return this.getEnvironment() === 'testing';
  }

  /**
   * 環境設定を初期化する
   */
  public initialize(): void {
    // 環境変数がまだロードされていない場合
    if (!this.env.get('ENV_LOADED')) {
      const environment = this.env.get('NODE_ENV', 'development');
      this.env.initializeFor(environment);
    }
  }

  /**
   * 設定が完了しているかチェック
   * @return {boolean} 設定が完了しているかどうか
   */
  public isConfigured(): boolean {
    return this.env.isConfigured();
  }

  /**
   * 必要な設定が揃っていない場合に警告を表示
   * @return {boolean} 設定が完了しているかどうか
   */
  public checkAndWarnIfNotConfigured(): boolean {
    if (!this.isConfigured()) {
      const ui = SpreadsheetApp.getUi();
      ui.alert(
        '設定が必要です',
        'LINEボットの設定が完了していません。「LINE Bot」メニューから「環境設定」を実行してください。',
        ui.ButtonSet.OK
      );
      return false;
    }
    return true;
  }
}
