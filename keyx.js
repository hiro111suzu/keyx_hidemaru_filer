//. get key
var time_start = tickCount;
var key = '';
if ( _iskeydown( 0x10 ) ) key += 'Shift+';
if ( _iskeydown( 0x12 ) ) key += 'Alt+';
if ( _iskeydown( 0x11 ) ) key += 'Ctrl+';
var ignore = { //- shift/ctrl/alt
	0x10: true,
	0x11: true,
	0x12: true,
	0x13: true,
	0xa0: true,
	0xa1: true,
	0xa2: true,
	0xa3: true,
	0xa4: true,
	0xa5: true
};
for ( var keycode = 1; keycode < 230; ++ keycode ) {
	if ( _iskeydown( keycode ) && ! ignore[ keycode ] ) break;
}

//. init
var actx = {};
_common_lib();
var ini_data = _get_inidata( ScriptFullName.replace( '.js', '.ini' ) );
key += ini_data.code2key[ keycode ] || keycode;

var user_conf = {
	debug_soft: ini_data.config.debug_soft
		? ini_data.config.debug_soft.env_expand()
		: ''
	,
	cmdp_path: ini_data.config.cmdp_path
		? ini_data.config.cmdp_path.env_expand()
		: ''
}
var dn_script = scriptFullName.parent().parent() + '\\';

//- コマンドパレットスクリプトを探す
if ( ! user_conf.cmdp_path ) {
	var pathset = [
		dn_script + 'cmdp\\cmdp.js' ,
		dn_script + 'cmdphf\\cmdp.js' ,
		dn_script + 'cmdp_hf\\cmdp.js' ,
		dn_script + 'cmdphf_v1\\cmdp.js' ,
	]
	for ( var idx in pathset ) {
		if ( ! pathset[ idx ].is_file() ) continue;
		user_conf.cmdp_path = pathset[ idx ];
		break;
	}
}

//. コマンド実行
_debug_log();
var cmd_line = ini_data.filer[ key.toLowerCase() ];

if ( ! cmd_line ) {
	_debug_log( key + ': コマンド未登録' );
	endMacro();
}
_debug_log( key + ': ' + cmd_line );

var method = cmd_line.split(' ')[0];
var rest = cmd_line.substring( method.length + 1 );
//_time_log( 'コマンド決定' );

//.. 各メソッド
if ( method == 'run' ) {
	try {
		actx.shell.run( cmd_line.substring( 4 ) );
	} catch( e ){
		_catch( e )
	}
	endMacro();
}

if ( method == 'open' ) {
	Open( rest, 2 );
	endMacro();
}
if ( method == 'cmd' ) {
	Command( rest );
	endMacro();
}
if ( method == 'js' ) {
	try {
		eval( rest );
	} catch( e ){
		_catch( e )
	}
	endMacro();
}

//.. スクリプトファイル?
var pathset = [
	[ method, rest ] ,
	[ cmd_line ] ,
	[ dn_script + method, rest ] ,
	[ dn_script + cmd_line ]
];
for ( idx in pathset ) {
	var fn = pathset[ idx ][0];
	var ext = fn.ext();
	var arg = pathset[ idx ][1];
	if ( fn.is_file() && ( ext == 'js' || ext == 'vbs'  ) ) {
		_debug_log( 'スクリプトファイル発見: ' + fn );
		_exec_scriopt( fn, arg );
		endMacro();
	}
}

//.. フォルダー
if ( cmd_line.is_folder() ) {
	Open( cmd_line, 2 );
	_debug_log( 'フォルダーらしいので開いた' );
	endMacro();
}
if ( method.is_file() ) {
	actx.shell.run( method + ' ' + rest );
	_debug_log( 'ファイルらしいので開いた' );
	endMacro();
}
if ( cmd_line.indexOf( 'https://' ) == 0 ) {
	actx.shell.run( cmd_line );	
	_debug_log( 'URLらしいので開いた' );
	endMacro();
}


//.. コマンドパレット
if ( ! user_conf.cmdp_path ) {
	message( 'コマンドパレットのパスが登録されていません' );
	endMacro();
}
if ( method.has( ';' ) ) {
	var method = cmd_line.split(';')[0];
	var rest = cmd_line.substring( method.length + 1 );
}
_exec_scriopt( user_conf.cmdp_path, method, rest );
endMacro();

//. func
//.. _catch
function _catch( e ) {
	message( 'keyxスクリプト コマンド実行失敗'
		+ '\nkey:\t' + key 
		+ '\nmethod:\t' + method
		+ '\nterm:\t' + rest
		+ '\nerror:\t' + e
	);
	endMacro();
}

//.. _exec_scriopt
function _exec_scriopt( fn, arg1, arg2 ) {
	sleep( 10 );
	actx.shell.run(
		fullName + ' /m3 /x ' + fn
		+ ( arg1 ? ' /a ' + arg1 : '' )
		+ ( arg2 ? ' /a ' + arg2 : '' )
	);
}

//.. _get_inidata
function _get_inidata( fn_ini ) {
	var obj_ini = actx.fs.OpenTextFile( fn_ini );
	var key, val, line, line0, section = 'dummy'; 
	var ini_data = {};
	while( ! obj_ini.AtEndOfStream ) {
		line = obj_ini.ReadLine().trim();
		line0 = line.charAt(0);
		if ( line0 == '[' ) {
			section = line.substring( 1, line.indexOf( ']' ) );
			ini_data[ section ] = {};
		} else {
			if ( line0 == ';' || line0 == '/' ) continue;
			key = line.split( '=', 2 )[0];
			val = line.substring( key.length + 1 ).trim();
			key = key.trim().toLowerCase();
			if ( ! key || ! val ) continue;
			ini_data[ section ][ key ] = val;
		}
	}
	return ini_data;
}

//.. _time_log
function _time_log( title ) {
	_debug_log( ( tickCount - time_start ) + ' msec - ' + title );
}

//.. _iskeydown
function _iskeydown( num ) {
	return getKeyState( num ) & 0x8000;
}

//. func 汎用
//.. _test
function _test( msg ) {
	if ( ! question( msg + '\n\n「いいえ」で終了' ) ) endMacro();
}

//.. _debug_log
function _debug_log( val, key ) {
	if ( ! user_conf || ! user_conf.debug_soft ) return;
	if ( ! val ) { //- 開始
		if ( ! user_conf.debug_soft.is_file() ) {
			message( 'debug_softの実行ファイルがありません\n' + user_conf.debug_soft  );
			user_conf.debug_soft = null;
			return;
		}
		val = '開始';
	}
	var type = typeof val;
	actx.shell.run(
		user_conf.debug_soft + ' '
		+ (
			'[' + scriptFullName.basename() + '] '
			+ ( key ? key +  '(' + type + ')\r\n' : '' )
			+ ( type == 'object' ? _JSON_encode( val ) : val )
		).q() ,
		0 //- hide
	);
}

//.. _JSON_encode
function _JSON_encode( obj ){
	var htmlfile = new ActiveXObject( 'htmlfile' );
	htmlfile.write( '<meta http-equiv="x-ua-compatible" content="IE=11">' );
	return htmlfile.parentWindow.JSON.stringify( obj );
}

	//.. _common_lib
function _common_lib() {
	actx = {
		fs: new ActiveXObject( "Scripting.FileSystemObject" ) ,
		shell: new ActiveXObject( "WScript.Shell" )
	};

		//... string 拡張
	//- 親ディレクトリ
	String.prototype.parent = function(){
		return actx.fs.GetParentFolderName( this );
	}

	//- basename
	String.prototype.basename = function(){
		return actx.fs.GetBaseName( this );
	}

	//- フルパスに
	String.prototype.fullpath = function( ext ){
		return GetDirectory() + '\\' + this + ( ext ? '.' + ext : '' );
	}

	//- 拡張子
	String.prototype.ext = function(){
		return actx.fs.GetExtensionName( this );
	}

	// is_file
	String.prototype.is_file = function(){
		return actx.fs.FileExists( this );
	}

	// is_folder
	String.prototype.is_folder = function(){
		return actx.fs.FolderExists( this );
	}

	//- ダブルクオーテーションで囲む
	String.prototype.q = function(){
		return '"' + this.replace( /"/g, '""' )  + '"';
	}
	//- has
	String.prototype.has = function( str ){
		return this.indexOf( str ) != -1;
	}
	//- add_wildcard
	String.prototype.add_wildcard = function() {
		return this.has( '*' ) ? this : '*' + this + '*' 
	}
	//- trim
	String.prototype.trim = function() {
		return this.replace( /^\s+|\s+$/g, '' );
	}
	//- env_expand
	String.prototype.env_expand = function() {
		return actx.shell.ExpandEnvironmentStrings( this );
	}
	String.prototype.split_l = function( sep ) {
		return this.split( sep, 2 )[0];
	}
	String.prototype.split_r = function( sep ) {
		return this.substring( this.split( sep, 2 )[0].length + sep.length );
	}
}

