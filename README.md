# 透かしスタジオ（Watermark Studio）

JPEG写真にテキストやロゴの透かしを重ねて書き出すブラウザアプリです。
画像処理はすべて端末内で完結し、写真が外部に送信されることはありません。

## 公開手順（GitHub Pages）

### 1. リポジトリを作る

GitHubで新しいリポジトリを作成します（例：`watermark-studio`）。
**Public** にしてください。Privateリポジトリの GitHub Pages は有料プランが必要です。

### 2. ファイルを置く

このフォルダの中身を、フォルダ構成を保ったままリポジトリ直下にアップロードします。

```
watermark-studio/
├── index.html
├── manifest.webmanifest
├── sw.js
├── .nojekyll
├── README.md
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png
    ├── apple-touch-icon.png
    └── favicon-32.png
```

ブラウザからアップロードする場合は、リポジトリ画面の
**Add file → Upload files** で、`icons` フォルダごとドラッグ＆ドロップできます。

### 3. Pages を有効にする

リポジトリの **Settings → Pages** を開き、

- Source: **Deploy from a branch**
- Branch: **main** / **/ (root)**

を選んで **Save**。1〜2分ほどで以下のURLで公開されます。

```
https://<ユーザー名>.github.io/watermark-studio/
```

### 4. ホーム画面に追加

- **Android / Chrome**：ヘッダーの「ホーム画面に追加」ボタン、またはメニューの「アプリをインストール」
- **iPhone / Safari**：共有ボタン（□に↑）→「ホーム画面に追加」

追加後はアドレスバーのないアプリとして起動し、オフラインでも使えます。

## 更新のしかた

`index.html` などを変更したら、**`sw.js` の先頭にある `CACHE_VERSION` を必ず上げてください。**

```js
const CACHE_VERSION = 'v1';   // → 'v2' に変更
```

これを忘れると、すでにインストール済みの端末で古いキャッシュが使われ続け、変更が反映されません。
バージョンを上げてプッシュすると、次回起動時にアプリ上部へ「新しいバージョンがあります」と表示されます。

## 技術メモ

- パスはすべて相対パス（`./`）なので、`https://ユーザー名.github.io/リポジトリ名/` のようなサブディレクトリ配信でも、独自ドメインの直下でもそのまま動きます
- Service Worker は HTTPS か localhost でのみ動作します。GitHub Pages は自動でHTTPSになるため条件を満たします
- ローカルで確認する場合は `file://` で開くと Service Worker が動きません。フォルダ内で以下を実行し、`http://localhost:8000` を開いてください

  ```bash
  python3 -m http.server 8000
  ```

- Webフォント（Google Fonts）と ZIP 書き出し用の JSZip は CDN から読み込み、初回アクセス時にキャッシュされます。2回目以降はオフラインでも利用できます
- `.nojekyll` は GitHub Pages の Jekyll 処理を無効化するためのファイルです。消さないでください

## 画質について

- 元画像の解像度・画素数は変更していません
- JPEG は仕様上、再保存時に必ず再圧縮が発生します。書き出し品質は既定で 100% です
- 完全な無劣化が必要な場合は、書き出し形式を **PNG（可逆）** に切り替えてください
