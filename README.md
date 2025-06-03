# LINE Bot Framework for Google Apps Script

## 概要

このプロジェクトは、Google Apps Script (GAS) を使用してLINE Messaging APIを実装するためのフレームワークです。シンプルで拡張性の高い設計により、LINE Botの開発を効率化します。

## 特徴

- **クリーンアーキテクチャ**: ファクトリーパターンやシングルトンパターンなどのデザインパターンを採用
- **型安全性**: TypeScriptによる堅牢な型定義
- **簡単な拡張**: イベントハンドラーの追加が容易
- **データ永続化**: Google Spreadsheetを使用したデータ管理
- **環境設定管理**: 複数環境（開発・本番）の設定管理

## フォルダ構造

```
src/
├── config/         # 設定関連
├── constants/      # 定数定義
├── factories/      # ファクトリークラス
├── handlers/       # イベントハンドラー
├── middlewares/    # ミドルウェア
├── models/         # データモデル
├── services/       # 外部サービス連携
└── utils/          # ユーティリティ
```

## 主要コンポーネント

### モデル
- `LineEvent`: LINE Platform からのイベント定義
- `User`: ユーザー情報管理
- `Message`: メッセージデータ管理

### ハンドラー
- `TextHandler`: テキストメッセージ処理
- `ImageHandler`: 画像メッセージ処理
- `PostbackHandler`: ポストバックイベント処理

### サービス
- `SpreadsheetService`: Google Spreadsheet データ管理
- `LineService`: LINE API 連携
- `CacheService`: キャッシュ管理

### ユーティリティ
- `Logger`: ログ管理
- `MessageFormatter`: メッセージフォーマット

## 使い方

1. Google Apps Script プロジェクトを作成
2. `clasp` を使用してコードをアップロード
3. LINE Developer Console でチャネルを作成
4. GAS をウェブアプリとしてデプロイ
5. Webhook URL を LINE Developer Console に設定

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/line-bot-gas.git

# 依存関係のインストール
npm install

# gasのセットアップ
clasp login
clasp create --type sheets --title "Your Project Name"

# ビルド
npm run build

# デプロイ
npm run deploy
```

## カスタマイズ方法

新しいイベントタイプを処理するには:

1. `handlers` ディレクトリに新しいハンドラークラスを作成
2. `HandlerFactory` に新しいハンドラーを登録

## 貢献

プルリクエストやイシューの報告は大歓迎です。

## ライセンス

Apache License 2.0

## 開発者

[al-rosa](https://github.com/al-rosa)
