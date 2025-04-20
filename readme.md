# 2Dアクションゲーム

TypeScriptとPixiJSを使用した2Dアクションゲームプロジェクトです。

## 必要条件

- Node.js (v16以上推奨)
- npm (v7以上推奨)

## インストール

```sh
# 依存パッケージのインストール
npm install
```

## 開発方法

### 開発サーバーの起動

```sh
npm run dev
```

開発サーバーが起動し、ブラウザで`http://localhost:5173`にアクセスすることでゲームをプレイできます。
コードの変更は自動的に反映されます。

### ビルド

```sh
npm run build
```

プロジェクトをビルドし、`dist`ディレクトリに出力します。

### ビルド結果のプレビュー

```sh
npm run preview
```

ビルドされたゲームをローカルでプレビューできます。

## プロジェクト構造

```
src/
├── game.ts          # メインゲームロジック
├── obstacles/       # 障害物関連
├── renderers/       # 描画処理
├── player/          # プレイヤー関連
├── utils/           # ユーティリティ関数
├── data/            # ゲームデータ
├── managers/        # 各種マネージャー
├── effects/         # エフェクト
└── characters/      # キャラクター関連
```

## 技術スタック

- TypeScript
- PixiJS v7.4.0
- Vite v5.0.0

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。