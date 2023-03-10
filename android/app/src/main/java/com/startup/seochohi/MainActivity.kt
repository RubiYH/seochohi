package com.startup.seochohi

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.util.Log
import android.view.View
import android.view.Window
import android.view.WindowManager
import android.webkit.*
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.*


class MainActivity : AppCompatActivity() {
//    private val mFilePathCallback: ValueCallback<*>? = null
    var filePathCallbackLollipop: ValueCallback<Array<Uri>>? = null
    var filePathCallbackNormal: ValueCallback<Uri>? = null
    var FILECHOOSER_NORMAL_REQ_CODE = 2001;
    var FILECHOOSER_LOLLIPOP_REQ_CODE = 2002;
    var cameraImageUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val CHANNEL_ID = getString(R.string.notification_channel_id)

        //create notification channel
        fun createNotificationChannel() {
            // Create the NotificationChannel, but only on API 26+ because
            // the NotificationChannel class is new and not in the support library
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val name = getString(R.string.channel_name)
                val descriptionText = getString(R.string.channel_description)
                val importance = NotificationManager.IMPORTANCE_DEFAULT
                val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                    description = descriptionText
                }
                // Register the channel with the system
                val notificationManager: NotificationManager =
                    getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
        }

        createNotificationChannel()

        val swipeRefreshLayout = findViewById<SwipeRefreshLayout>(R.id.swiperefreshlayout);
        val webView = findViewById<WebView>(R.id.webView)
        val mSplashView = findViewById<LinearLayout>(R.id.splash_view)
        val errorView = findViewById<LinearLayout>(R.id.errorView)
        val windowErrorView = findViewById<LinearLayout>(R.id.windowError)
        val reloadBtn = findViewById<Button>(R.id.reloadBtn)
        val reloadBtn2 = findViewById<Button>(R.id.reloadBtn2)
        val reportError = findViewById<Button>(R.id.reportError)
        val goodBye = findViewById<LinearLayout>(R.id.goodBye)

        //????????????
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
            swipeRefreshLayout.isRefreshing = false
        }

        swipeRefreshLayout.isEnabled = false

        webView.visibility = View.GONE
        errorView.visibility = View.GONE
        windowErrorView.visibility = View.GONE
        mSplashView.visibility = View.GONE

        val webURL = getString(R.string.url)

        fun reloadPage() {
            mSplashView.visibility = View.VISIBLE
            windowErrorView.visibility = View.GONE
            errorView.visibility = View.GONE
            webView.visibility = View.GONE
            webView.loadUrl(webURL)
        }

        var windowErrorDetails = ""

        //send window.onerror via email

        fun sendErrorEmail(error: String?) {

            val errorDetails = JSONObject(error)
            val emailAddress = getString(R.string.report_email)
            val title = "???????????? ??? ?????? ??????: ${errorDetails.getString("e")}"

            val currentTime: Date = Calendar.getInstance().time

            val content =
                """
                    ---------------------------------------
                    ?????? ?????? ??????: ${currentTime}
                    OS ??????: ${android.os.Build.VERSION.RELEASE}
                    API ??????: ${android.os.Build.VERSION.SDK_INT}
                    ????????????: ${android.os.Build.DEVICE}
                    ??????: ${android.os.Build.MODEL}
                    Product: ${android.os.Build.PRODUCT}
                    ---------------------------------------
                    
                    ?????? ????????????
                    ---------------------------------------
                    ??????: ${errorDetails.getString("e")}
                    ??????: ${errorDetails.getString(("s"))}
                    ???: ${errorDetails.getString("l")}
                    ???: ${errorDetails?.getString("c")}
                    ---------------------------------------
                """.trimIndent()

            val intent = Intent(Intent.ACTION_SENDTO) // ?????? ?????? ??????
                .apply {
                    type = "text/plain" // ????????? ?????? ??????
                    data = Uri.parse("mailto:") // ????????? ???????????? ????????? ??????????????? ??????

                    putExtra(Intent.EXTRA_EMAIL, arrayOf(emailAddress)) // ?????? ?????? ?????? ??????
                    putExtra(Intent.EXTRA_SUBJECT, title) // ?????? ?????? ??????
                    putExtra(Intent.EXTRA_TEXT, content) // ?????? ?????? ??????
                }

            if (intent.resolveActivity(packageManager) != null) {
                startActivity(Intent.createChooser(intent, "?????? ?????? ?????? ????????????"))
            } else {
                Toast.makeText(this, "??????: ????????? ????????? ??? ????????????", Toast.LENGTH_SHORT).show()
            }
        }

        webView.apply {
            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()
            settings.javaScriptEnabled = true
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            settings.allowContentAccess = true
            settings.cacheMode = WebSettings.LOAD_NO_CACHE
            settings.domStorageEnabled = true
            settings.defaultTextEncodingName = "UTF-8"
            settings.allowFileAccess = true
            settings.layoutAlgorithm = WebSettings.LayoutAlgorithm.NORMAL
            settings.setEnableSmoothTransition(true)
            settings.builtInZoomControls = false
            settings.useWideViewPort = true
        }

        //hardware acceleration
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        } else {
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        }

        //button click handling
        reloadBtn.setOnClickListener {
            reloadPage()
        }

        reloadBtn2.setOnClickListener {
            reloadPage()
        }

        reportError.setOnClickListener {
            val errorDetails = windowErrorDetails
            sendErrorEmail(errorDetails)
        }

//  ?????? ?????????
        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    Log.d("onReceivedError", error?.description.toString())
                    Log.d("onReceivedErrorCode", error?.errorCode.toString())

                }

                if (request?.isForMainFrame == true) {
                    swipeRefreshLayout.isEnabled = false
                    val window: Window = window
                    window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
                    window.statusBarColor = Color.parseColor("#ffffff")

                    //?????? ?????????
                    val errorMessage = findViewById<TextView>(R.id.errormsg)
                    errorMessage.text = ""

                    webView.visibility = View.GONE
                    mSplashView.visibility = View.GONE
                    windowErrorView.visibility = View.GONE
                    errorView.visibility = View.VISIBLE

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {

                        when (error?.errorCode) {

                            ERROR_HOST_LOOKUP -> errorMessage.text =
                                getString(R.string.ERROR_HOST_LOOKUP)
                            ERROR_CONNECT -> errorMessage.text = getString(R.string.ERROR_CONNECT)
                            ERROR_REDIRECT_LOOP -> errorMessage.text =
                                getString(R.string.ERROR_REDIRECT_LOOP)
                            ERROR_TIMEOUT -> errorMessage.text = getString(R.string.ERROR_TIMEOUT)
                            ERROR_TOO_MANY_REQUESTS -> errorMessage.text =
                                getString(R.string.ERROR_TOO_MANY_REQUEST)

                            else -> errorMessage.text = getString(R.string.DEFAULT)

                        }
                    } else {
                        errorMessage.text = getString(R.string.DEFAULT)
                    }

                }

            }

            override fun onReceivedHttpError(
                view: WebView?,
                request: WebResourceRequest?,
                errorResponse: WebResourceResponse?
            ) {
                super.onReceivedHttpError(view, request, errorResponse)

                Log.d("HTTPERROR", errorResponse?.statusCode.toString())

                if(request?.isForMainFrame == true) {
                    //?????? ?????????
                    val errorMessage = findViewById<TextView>(R.id.errormsg)
                    errorMessage.text = ""

                    "????????? ?????????????????????. ?????? ${errorResponse?.statusCode.toString()}".also {
                        errorMessage.text = it
                    }

                    webView.visibility = View.GONE
                    mSplashView.visibility = View.GONE
                    windowErrorView.visibility = View.GONE
                    errorView.visibility = View.VISIBLE
                }
            }

//            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
//                super.onPageStarted(view, url, favicon)
//                webView.visibility = View.GONE
//                mSplashView.visibility = View.VISIBLE
//            }

            //Splash Screen
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)

                if (windowErrorView.visibility == View.VISIBLE) return;

                mSplashView.visibility = View.GONE
                windowErrorView.visibility = View.GONE
                webView.visibility = View.VISIBLE

                if (url.toString().startsWith("file:///android_asset/")) return;
                swipeRefreshLayout.isEnabled = false
            }


        }

        webView.webChromeClient = object : WebChromeClient() {


            @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: WebChromeClient.FileChooserParams?
            ): Boolean {


                // Callback ?????????
                // Callback ?????????
                if (filePathCallbackLollipop != null) {
                    filePathCallbackLollipop!!.onReceiveValue(null)
                    filePathCallbackLollipop = null
                }
                filePathCallbackLollipop = filePathCallback

                val isCapture = fileChooserParams!!.isCaptureEnabled

                runCamera(isCapture, 1)
                return true


            }

            fun runCamera(_isCapture: Boolean, selectedType: Int) {
                var intentCamera = Intent(MediaStore.ACTION_IMAGE_CAPTURE);

                var path: File = Environment.getExternalStorageDirectory();
                var file: File = File(path, "temp.jpg"); // temp.png ??? ???????????? ????????? ??? ????????? ?????????????????? ????????? ????????????

                cameraImageUri = Uri.fromFile(file);
                intentCamera.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);

                if (!_isCapture) { // ???????????? ?????????, ????????? ?????? ????????? ?????? ???
                    var pickIntent = Intent(Intent.ACTION_PICK);

                    if (selectedType == 1) {
                        pickIntent.setType(MediaStore.Images.Media.CONTENT_TYPE);
                        pickIntent.setData(MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                    }

                    var pickTitle: String = "????????? ????????? ????????? ???????????????.";
                    var chooserIntent = Intent.createChooser(pickIntent, pickTitle);

                    val intent = Intent(Intent.ACTION_PICK)
                    intent.type = "image/*"
                    intent.action = Intent.ACTION_GET_CONTENT
                    startActivityForResult(intent, FILECHOOSER_LOLLIPOP_REQ_CODE);

                }
            }

        }



        if(getString(R.string.enabled) == "true") {
            webView.loadUrl(webURL)
        } else {
            webView.visibility = View.GONE
            mSplashView.visibility = View.GONE
            windowErrorView.visibility = View.GONE
            errorView.visibility = View.GONE
            goodBye.visibility = View.VISIBLE
        }


        class WebAppInterface(private val mContext: Context) {

            @JavascriptInterface
            fun getBase64FromBlobData(base64Data: String, newname: String) {
                val base64value = base64Data.substring(base64Data.indexOf("base64,") + 7)
                val PDFAsBytes: ByteArray = Base64.decode(base64value, 0)

                val dwldsPath = File(
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                    newname + ".pdf"
                )
                //if already exists
                if (dwldsPath.exists()) {
                    Toast.makeText(mContext, "????????? ?????? ???????????????.", Toast.LENGTH_SHORT).show()
                    return;
                }

                try {


                    val os = FileOutputStream(dwldsPath, false)
                    os.write(PDFAsBytes)
                    os.flush()

                    if (dwldsPath.exists()) {
                        runOnUiThread {
                            Toast.makeText(mContext, "??????????????? ?????????????????????.", Toast.LENGTH_SHORT).show()

                            //notification
                            val intent = Intent(DownloadManager.ACTION_VIEW_DOWNLOADS).apply {
                                flags =
                                    Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                            }

                            val pendingIntent: PendingIntent =
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                                    PendingIntent.getActivity(
                                        mContext,
                                        0,
                                        intent,
                                        PendingIntent.FLAG_IMMUTABLE
                                    )
                                } else {
                                    PendingIntent.getActivity(
                                        mContext,
                                        0,
                                        intent,
                                        PendingIntent.FLAG_UPDATE_CURRENT
                                    )
                                }

                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                val builder = NotificationCompat.Builder(mContext, CHANNEL_ID)
                                    .setSmallIcon(R.mipmap.ic_launcher)
                                    .setContentTitle("$newname")
                                    .setContentText(getString(R.string.download_complete))
                                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                                    .setContentIntent(pendingIntent)
                                    .setAutoCancel(true)
                                    .build()

                                val manager =
                                    getSystemService(NOTIFICATION_SERVICE) as NotificationManager

                                manager.notify(0, builder)

                            } else {
                                val builder = NotificationCompat.Builder(mContext)
                                    .setSmallIcon(R.mipmap.ic_launcher)
                                    .setContentTitle("$newname")
                                    .setContentText(getString(R.string.download_complete))
                                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                                    .setAutoCancel(true)
                                    .build()

                                val manager =
                                    getSystemService(NOTIFICATION_SERVICE) as NotificationManager

                                manager.notify(0, builder)
                            }
                        }
                    }

                } catch (e: NumberFormatException) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        val builder = NotificationCompat.Builder(mContext, CHANNEL_ID)
                            .setSmallIcon(R.mipmap.ic_launcher)
                            .setContentTitle("$newname")
                            .setContentText(getString(R.string.download_error))
                            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                            .setAutoCancel(true)
                            .build()

                        val manager =
                            getSystemService(NOTIFICATION_SERVICE) as NotificationManager

                        manager.notify(0, builder)

                    } else {
                        val builder = NotificationCompat.Builder(mContext)
                            .setSmallIcon(R.mipmap.ic_launcher)
                            .setContentTitle("$newname")
                            .setContentText(getString(R.string.download_error))
                            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                            .setAutoCancel(true)
                            .build()

                        val manager =
                            getSystemService(NOTIFICATION_SERVICE) as NotificationManager

                        manager.notify(0, builder)
                    }
                }
            }

            //????????? ?????? ??????
            @JavascriptInterface
            fun changeStatusBarColor(color: String) {
                runOnUiThread {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        val window: Window = window
                        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
                        window.statusBarColor = Color.parseColor(color)
                    }
                }

            }

            //window.onerror handling
            @JavascriptInterface
            fun windowOnError(details: String?) {
//                runOnUiThread {
//                    webView.visibility = View.GONE
//                    mSplashView.visibility = View.GONE
//                    errorView.visibility = View.GONE
//                    windowErrorView.visibility = View.VISIBLE
//
//                    val errorDetails = findViewById<TextView>(R.id.errorDetails)
//                    val errorObject = JSONObject(details)
//
//                    windowErrorDetails = errorObject.toString()
//
//                    errorDetails.text = errorObject.getString("e")
//                }
            }


        }

        webView.addJavascriptInterface(WebAppInterface(this), "Android")


    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        var data = data
        when (requestCode) {
            FILECHOOSER_NORMAL_REQ_CODE -> if (resultCode == RESULT_OK) {
                if (filePathCallbackNormal == null) return
                val result =
                    if (data == null || resultCode != RESULT_OK) null else data.data //  onReceiveValue ??? ????????? ????????????.
                filePathCallbackNormal!!.onReceiveValue(result)
                filePathCallbackNormal = null
            }
            FILECHOOSER_LOLLIPOP_REQ_CODE -> if (resultCode == RESULT_OK) {
                if (filePathCallbackLollipop == null) return
                if (data == null) data = Intent()
                if (data.data == null) data.data = cameraImageUri
                filePathCallbackLollipop!!.onReceiveValue(
                    WebChromeClient.FileChooserParams.parseResult(
                        resultCode,
                        data
                    )
                )
                filePathCallbackLollipop = null
            } else {
                if (filePathCallbackLollipop != null) {   //  resultCode??? RESULT_OK??? ???????????? ????????? null ???????????? ??????.(????????? ?????? ????????? ???????????? input ????????? ???????????? ???????????? ??????)
                    filePathCallbackLollipop!!.onReceiveValue(null)
                    filePathCallbackLollipop = null
                }
                if (filePathCallbackNormal != null) {
                    filePathCallbackNormal!!.onReceiveValue(null)
                    filePathCallbackNormal = null
                }
            }
            else -> {}
        }
        super.onActivityResult(requestCode, resultCode, data)
    }

    private var backpressedTime: Long = 0;

    override fun onBackPressed() {
        val webView = findViewById<WebView>(R.id.webView)

//        if (webView.canGoBack()) {
//            webView.goBack()
//        } else {
        if (System.currentTimeMillis() >= backpressedTime + 2000) {
            backpressedTime = System.currentTimeMillis();
            Toast.makeText(this, "\'??????\' ????????? ?????? ??? ???????????? ???????????????.", Toast.LENGTH_SHORT).show();
        } else if (System.currentTimeMillis() <= backpressedTime + 2000) {
            finish()
        }

//        }
    }



}





