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
/**
 * 環境変数管理クラス
 * スクリプトプロパティを環境変数として扱う
 */
export class EnvConfig {
  private static instance: EnvConfig;
  private properties: GoogleAppsScript.Properties.Properties;
  private cache: GoogleAppsScript.Cache.Cache;
  private envCache: Record<string, string> = {};

  /**
   * コンストラクタ
   */
  private constructor() {
    this.properties = PropertiesService.getScriptProperties();
    this.cache = CacheService.getScriptCache();
  }

  /**
   * シングルトンインスタンスを取得
   * @return {EnvConfig} EnvConfigインスタンス
   */
  public static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  /**
   * 環境変数を取得
   * @param {string} key キー
   * @param {string} defaultValue デフォルト値
   * @return {string} 環境変数の値
   */
  public get(key: string, defaultValue = ''): string {
    // メモリキャッシュをチェック
    if (this.envCache[key] !== undefined) {
      return this.envCache[key];
    }

    // スクリプトキャッシュをチェック
    const cachedValue = this.cache.get(`ENV_${key}`);
    if (cachedValue !== null) {
      this.envCache[key] = cachedValue;
      return cachedValue;
    }

    // スクリプトプロパティから取得
    const value = this.properties.getProperty(key) || defaultValue;

    // キャッシュに保存
    this.cache.put(`ENV_${key}`, value, 3600); // 1時間キャッシュ
    this.envCache[key] = value;

    return value;
  }

  /**
   * 環境変数を設定
   * @param {string} key キー
   * @param {string} value 値
   */
  public set(key: string, value: string): void {
    this.properties.setProperty(key, value);
    this.cache.put(`ENV_${key}`, value, 3600); // 1時間キャッシュ
    this.envCache[key] = value;
  }

  /**
   * 複数の環境変数を一度に設定
   * @param {Record<string, string>} envVars キーと値のマップ
   */
  public setAll(envVars: Record<string, string>): void {
    if (!envVars || typeof envVars !== 'object') {
      return;
    }

    Object.keys(envVars).forEach(key => {
      this.set(key, envVars[key]);
    });
  }

  /**
   * 環境変数のリストを取得
   * @return {Record<string, string>} 環境変数のマップ
   */
  public getAll(): Record<string, string> {
    const properties = this.properties.getProperties();
    // メモリキャッシュも更新
    this.envCache = { ...properties };
    return properties;
  }

  /**
   * スクリプトプロパティから全環境変数を削除
   */
  public clearAll(): void {
    this.properties.deleteAllProperties();
    Object.keys(this.envCache).forEach(key => {
      this.cache.remove(`ENV_${key}`);
    });
    this.envCache = {};
  }

  /**
   * スクリプトエディタのUI経由で環境変数を設定
   * @param {string} key 環境変数キー
   * @param {string} description 説明文
   * @param {string} defaultValue デフォルト値
   * @return {boolean} 成功したかどうか
   */
  public promptForProperty(
    key: string,
    description: string,
    defaultValue = ''
  ): boolean {
    try {
      const ui = SpreadsheetApp.getUi();
      const currentValue = this.get(key, defaultValue);

      const result = ui.prompt(
        `${key} の設定`,
        `${description}\n\n現在の値: ${currentValue || '(未設定)'}`,
        ui.ButtonSet.OK_CANCEL
      );

      if (result.getSelectedButton() === ui.Button.OK) {
        const newValue = result.getResponseText();
        this.set(key, newValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to prompt for property ${key}: ${error}`);
      return false;
    }
  }

  /**
   * 環境設定が完了しているかどうか
   * @return {boolean} 環境設定が完了しているかどうか
   */
  public isConfigured(): boolean {
    // 必須の環境変数がすべて設定されているかチェック
    const requiredKeys = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET'];

    return requiredKeys.every(key => !!this.get(key));
  }

  /**
   * 環境に応じた設定の初期化
   * @param {string} environment 環境名
   */
  public initializeFor(environment = 'development'): void {
    this.set('NODE_ENV', environment);

    // 環境ごとのデフォルト値
    const defaults: Record<string, Record<string, string>> = {
      development: {
        DEBUG_MODE: 'true',
        LOG_LEVEL: 'DEBUG',
      },
      production: {
        DEBUG_MODE: 'false',
        LOG_LEVEL: 'INFO',
      },
      testing: {
        DEBUG_MODE: 'true',
        LOG_LEVEL: 'DEBUG',
        TEST_MODE: 'true',
      },
    };

    // 環境に応じたデフォルト値を設定
    const envDefaults =
      defaults[environment as keyof typeof defaults] || defaults.development;
    this.setAll(envDefaults);

    this.set('ENV_LOADED', 'true');
  }

  /**
   * スクリプトエディタのUIから環境変数を設定
   * @return {boolean} 成功したかどうか
   */
  public configureFromUI(): boolean {
    try {
      const ui = SpreadsheetApp.getUi();

      // 環境の選択
      const envResult = ui.prompt(
        '環境の選択',
        '環境を選択してください (development, production, testing):',
        ui.ButtonSet.OK_CANCEL
      );

      if (envResult.getSelectedButton() !== ui.Button.OK) {
        return false;
      }

      const environment = envResult.getResponseText() || 'development';
      this.initializeFor(environment);

      // LINE設定
      const lineConfigured =
        this.promptForProperty(
          'LINE_CHANNEL_ACCESS_TOKEN',
          'LINE Channel Access Tokenを入力してください:'
        ) &&
        this.promptForProperty(
          'LINE_CHANNEL_SECRET',
          'LINE Channel Secretを入力してください:'
        );

      if (!lineConfigured) {
        return false;
      }

      // その他設定
      this.promptForProperty(
        'USER_DATA_SPREADSHEET_ID',
        'ユーザーデータ保存用スプレッドシートIDを入力してください (空白の場合は自動生成されます):'
      );

      this.promptForProperty(
        'DEBUG_MODE',
        'デバッグモードを有効にしますか? (true/false):',
        this.get('DEBUG_MODE')
      );

      ui.alert(
        '設定完了',
        `${environment} 環境の設定が完了しました。`,
        ui.ButtonSet.OK
      );

      return true;
    } catch (error) {
      console.error(`Configuration error: ${error}`);
      return false;
    }
  }
}
