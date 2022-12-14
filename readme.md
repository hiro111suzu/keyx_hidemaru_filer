# keyx 秀丸ファイラー版: INIファイルでツールとキー割り当てを管理
[作者: suzu](https://github.com/hiro111suzu/hidemaru_docs/blob/main/README.md) /
[バージョン: 0](https://github.com/hiro111suzu/keyx_hidemaru_filer/releases/) /
[GitHub][rel] /
[公式ライブラリ](https://hide.maruo.co.jp/lib/hmfcscript/keyx_hf.html)

[rel]: https://github.com/hiro111suzu/keyx_hidemaru_filer

# 概要
* 秀丸ファイラーClassic（以下、秀丸ファイラー）のキー割り当てとツール登録の設定画面は、極めて高度で良くデザインされています。とはいえ、同期や大掃除、マニアックなことをしようと思うと、面倒な側面も少々あります。
* 「キー割り当てとツール登録をINIファイルで管理できたらいいのにな」と思っているユーザーも多いと思います。
	+ INIファイル一個だけなら見通しが良くなり、忘れてしまった、もう使ってない、なんだかわからないスクリプトにキーが当たっている状況を避けられる
	+ OneDriveなどのクラウドストレージでの同期、コメントの付加、コメントアウト、比較、世代管理など、テキストファイル管理のメリットを享受できる
	+ 一時的に入れ替えたり、別スクリプトから動的に参照・変更することも可能
* このkeyxは、（完全ではないですが）それを実現するスクリプトです。
* 拙作の「[秀丸ファイラーコマンドパレット][コマンドパレット]」と組み合わせて使うと、双方をより有効に活用できます。
* 例によって、[秀丸エディタ版][]も公開しています。
	+ 実質このシステムは、エディタ版のほうが有用度は高いと思いますが、同じやり方で設定を管理できるのは大きなメリットだと思います。

[コマンドパレット]:https://github.com/hiro111suzu/cmdp_hidemaru_filer
[秀丸エディタ版]:https://github.com/hiro111suzu/keyx_hidemaru_editor


# 仕様と使用法
## インストール
1. アーカイブを適当なフォルダーに置く
	+ 秀丸ファイラースクリプトを置くフォルダーを決めて多くとよい
2. *keyx.js* をスクリプト登録する
3. 後述の解説に従って、キー登録や、INI編集などの設定をおこなう

## 仕様
* *keyx.js* は、以下を実行するだけの非常に単純なスクリプトです。
	1. 実行時に押されていたキーを調べる
	2. それに対応するコマンドをINIファイルから探し出す
	3. それを適当に実行
* *keyx.js* にたくさんキーを割り当ててしまえば、それらのキーはすべてkeyxのやり方で管理できることになります。
	+ 秀丸ファイラーは、ひとつのツール（スクリプト）に複数組のキーを割り当てられる
	+ スクリプト登録は *keyx.js* のみでOK
	+ キー登録は使いたいキーの分の作業が必要だが、試行錯誤の不要な単純作業となる
		- 未使用のキーであれば無駄に割り当てても特にデメリットはないので、「具体的な使い道がないが、多めに登録しておく」といった運用も可能
* INIファイル、*keyx.ini* には、各キーに割り当てるコマンドを書いていきます。
* コマンドは、多彩な機能を利用できます。
	+ [コマンドパレット]のコマンドを実行、秀丸ファイラーコマンド、スクリプト文、ファイルを実行、フォルダーを開くなど

## INIファイル
### [config] セクション
* *debug_soft* キー
	+ 指定したソフトにデバッグメッセージを出力する
	+ 作ったコマンドが思うように動かないときなどの調査に使う
	+ そのパスで指定したソフトにデバッグメッセージを出力する
		- [HmSharedOutputPane](https://hide.maruo.co.jp/lib/macro/hmsharedoutputpane.html) を使うことを想定している
		- その他、コマンドライン引数で受け取った文字列を記録するタイプのソフトなら使えるはず
	+ 動作が遅くなるので、用が済んだらコメントアウトして無効にしておくべき
* *cmdp_path* キー
	+ [コマンドパレット]のスクリプト *cmdp.js* フルパスを書き込む
	+ 指定しなくても、keyxのフォルダーと同列のフォルダーから適当に探すが、指定したほうが確実

### [code2key] セクション
* キーコードとキー名の対応
* 大文字小文字は区別されない
* INIファイル内で対応すればよい、キー名は自分でわかりやすいように書き換えてもOK

### [filer] セクション
* キー設定を書き込むセクション
	+ (秀丸エディタ版と仕様を似せるためのセクション名)
	+ 例

```
[filer]
; Ctrlを押しながらHキーを押すと、"menu/help"というコマンドを実行される
Ctrl+h = menu/help
```

* INIキー名は、キーボードのキー（どちらも「キー」でややこしい）
	+ 大文字小文字は区別されない
	+ キー名（キーボードの方）は、スクリプト内で定義
	+ 修飾キーとの同時押しは ```Shift+Ctrl+Alt+a``` のように表記する
* 「値」はのコマンド文
	+ コマンド文はスペースの前が「手法」、それ以降は引数となる

|手法   |内容                                     |例                         |
|:------|:----------------------------------------|:--------------------------|
|*cmd*  |[秀丸ファイラーコマンド][]               |```cmd ツールの整理... ``` |
|*open* |秀丸ファイラーで開く                     |```open c:\```             |
|*run*  |Windowsシェルで開く、フィアル名やURLなど |```run cmd.exe```          |
|*js*   |JScript文の実行                          |```js message('hoge');```  |

[秀丸ファイラーコマンド]:https://help.maruo.co.jp/hmfilerclassic/hmfilerclassic_command.html

* それ以外の文字列の場合
	+ スクリプトファイル名だったら、そのスクリプトを実行
	+ ファイル名、フォルダ名、URLだったら、それを開く
	+ コマンドパレットに、コマンドとして渡す

```
;コマンドパレットの登録コマンドの例
F1 = menu/conf

;秀丸ファイラーコマンドの例
Ctrl+F2 = cmd 名前の変更(大文字小文字の統一)

;スクリプトファイル実行の例
Ctrl+5 = searchkit\searchkit.js es_search

;スクリプト文実行の例；
Ctrl+Alt+Y = js message('Hello world');

;URLを開く
Ctrl+G = https://google.com

;パスを開く
Shift+Ctrl+P = c:\program files
```

### [sample] セクション
* 使用されない
* キーとコマンドのサンプルが書き込んである

## おすすめの使用法
1. まずは、スクリプト*keyx.js*をツール登録する
2. 使っていないキー（例 Ctrl+b）を、*keyx.js* に割り当てる
	+ 「キー割り当て」の設定ウインドウでは、検索ボックスに"keyx"と入力すると探しやすい
	+ 検索ボックスはキー名にも使えるので、未割り当てのキーを探すのにも便利
3. INIファイルを編集し、そのキー用の機能を記述
	+ 例: ```ctrl+b = js message("hello world");```
	+ [HmSharedOutputPane](https://hide.maruo.co.jp/lib/macro/hmsharedoutputpane.html) を導入すれば、デバッグメッセージを秀丸エディタのアウトプット枠に出力できるので、動作の確認が容易になる。
		- 上述の *config*セクション、の *debug_soft* の項目を参照
4. 使用感が掴めたら、割り当てるキーをどんどん増やしていく
	+ 設定ウインドウのリストボックス下の「複製(D)」のボタンを押すと、選択した項目が複製され、別のキーを追加で割り当てられるようになる
	+ 使っていないキーを余分にキー割り当てしても特にデメリットはないはずなので、使い道は後で考えるとして、どんどん登録していけばよいと思われる

## 短所と対処法
* これで登録した機能はツールメニューやジェスチャーから呼べない
	+ そういった公式機能経由で起動したい機能は、普通にスクリプト登録するべき
* 一つの動作にいちいち別のスクリプトを経由するので、無駄なオーバーヘッドになる
	+ 作者の古めのPCで、数十ミリ秒程度の遅延が生じている様子
	+ 気になるなら連打系の機能は登録しないほうが良い
* サポートがない
	+ 見てわかるとおり、わりと単純なスクリプト
	+ 今後の仕様変更などへの対応は容易だと思われる

# 更新履歴
* [v1][rel]
	+ キーコードとキー名の対応表をINIファイルに移した
* 無印
	+ 公開

# 使用について
* 使用、複製、改造、再配布に制限はありません。（CC0 1.0）
* 無保証です。

