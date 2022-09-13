﻿# keyx: INIファイルひとつでツールとキー割り当てを管理

作者: suzu

# 概要
* 秀丸ファイラーClassic（以下、秀丸ファイラー）のキー割り当てとツール登録の設定画面は、極めて高度で良くデザインされています。とはいえ、同期や大掃除、マニアックなことをしようと思うと、面倒な側面も少々あります。
* 「キー割り当てとツール登録をINIファイルで管理できたらいいのにな」と思っているユーザー多いと思います。
	+ INIファイル一個だけなら見通しが良くなり、忘れてしまった、もう使ってない、なんだかわからないスクリプトにキーが当たっている状況を避けられる
	+ OneDriveなどのクラウドストレージでの同期、コメントの付加、コメントアウト、比較、世代管理など、テキストファイル管理のメリットを享受できる
	+ 一時的に入れ替えたり、別スクリプトから動的に参照・変更することも可能
* このkeyxは、（完全ではないですが）それを実現するスクリプトです。
* 拙作の「秀丸ファイラーコマンドパレット」と組み合わせて使うと、双方をより有効に活用できます。
* 例によって、秀丸エディタ版も公開しています。
	+ 実質このシステムは、エディタ版のほうが有用度は高いと思いますが、同じやり方で設定を管理できるのは大きなメリットだと思います。

# 仕様と使用法
## 仕様
* *keyx.js* は、以下を実行するだけの非常に単純なスクリプトです。
	1. 実行時に押されていたキーを調べる
	2. それに対応するコマンドをINIファイルから探し出す
	3. それを別スクリプトに渡す
* *keyx.js* にたくさんキーを割り当ててしまえば、それらのキーはすべてkeyxのやり方で管理できることになります。
	+ 秀丸ファイラーつのツール（スクリプト）に複数組のキーを割り当てられる
* INIファイル、*keyx.ini* に各キーに割り当てるコマンドを書いていきます。
* コマンドは、多彩な機能を利用できます。
	+ コマンドパレットのコマンドを実行、秀丸ファイラーコマンド、スクリプト、ファイルを実行、フォルダーを開く

## INIファイル
### [config] セクション
* キー *debug_soft*
	+ 指定したソフトにデバッグメッセージを出力する
	+ 作ったコマンドが思うように動かないときなどに使う
	+ そのパスで指定したソフトにデバッグメッセージを出力する
		- [HmSharedOutputPane](https://hide.maruo.co.jp/lib/macro/hmsharedoutputpane.html) を使うことを想定している
		- その他、コマンドライン引数で受け取った文字列を記録するタイプのソフトなら使えるはず
	+ 動作が遅くなるので、用が済んだらコメントアウトして無効にしておくべき
* キー *cmdp_path*
	+ コマンドパレットのスクリプト *cmdp.js* フルパスを書き込む
	+ デフォルトでは、keyxのフォルダーと同列の "cmdp_hf\cmdp.js"

### [filer] セクション
* キー設定を書き込むセクション
* (秀丸エディタ版と仕様と統一するためのセクション名)
* INIキー名は、キーボードのキー（どちらも「キー」でややこしい）
	+ 大文字小文字は区別されない
	+ キー名（キーボードの方）は、マクロ内で定義
	+ INIファイルと対応さえすればよいので、自由に書き換えてもOK
* 「値」はのコマンド文
	+ コマンド分はスペースの前が「手法」、それ以降は引数となる

|手法   |内容                                            |
|:------|:-----------------------------------------------|
|*cmd*  |秀丸ファイラーコマンド、「ツールの整理...」など |
|*open* |秀丸ファイラーで開く                            |
|*run*  |Windowsシェルで開く、フィアル名やURLなど        |
|*js*   |JScript文の実行                                 |


* それ以外の文字列の場合
	+ スクリプトファイル名だったら、そのスクリプトを実行
	+ ファイル名、フォルダ名、URLだったら、それを開く
	+ コマンドパレットに、コマンドとして渡す

```
	;コマンドパレットの登録コマンドの例
	F1 = menu/conf
	;スクリプトファイル実行の例
	ctrl+x = directoryname\jsfilename.js
	;スクリプト実行
	Ctrl+5 = searchkit\searchkit.js es_search
	;スクリプト文実行の例；
	ctrl+y = js message('Hello world');
	;URLを開く
	Ctrl+G = https://google.com
	;パスを開く
	Shift+Ctrl+P = c:\program files
```

## おすすめの使用法
1. まずは、スクリプト*keyx.js*をツール登録する
2. 使っていないキー（例 Ctrl+b）を、*keyx.js* に割り当てる
3. INIファイルを編集し、そのキー用の機能を記述

```
ctrl+b = js message("hello world");
```

4. 使用感が掴めたら、割り当てるキーをどんどん増やしていく

## 短所と対処法
* これで登録した機能はツールメニューやジェスチャーから呼べない
	+ そういった公式機能経由で起動したい機能は、普通にスクリプト登録するべき
* 一つの動作にいちいち別のスクリプトを経由するので、無駄なオーバーヘッドになる
	+ 作者は連打系のスクリプトにも使いまくってて、遅延も問題も感じていない
		- 古めのPCで、数十マイクロ秒程度
	+ 気になるなら連打系のスクリプトは登録しないほうが良いかも
* サポートがない
	+ 見てわかるとおり、極めて単純なマクロ
	+ 今後の仕様変更などへの対応は容易だと思われる

# 使用について
* 使用、複製、改造、再配布に制限はありません。
* 無保証です。

