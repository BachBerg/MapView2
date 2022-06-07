package com.example.mapview

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.estimote.mustard.rx_goodness.rx_requirements_wizard.Requirement
import com.estimote.mustard.rx_goodness.rx_requirements_wizard.RequirementsWizardFactory
import com.estimote.proximity_sdk.api.*
import com.example.mapview.CloudCredentials.APP_ID
import com.example.mapview.CloudCredentials.APP_TOKEN
import com.example.mapview.ui.theme.MapViewTheme
import java.util.*
import kotlin.collections.ArrayList
import kotlin.math.log

private const val TAG = "PROXIMITY"

class MainActivity : ComponentActivity() {

    private lateinit var proximityObserver: ProximityObserver
    private var proximityObservationHandler: ProximityObserver.Handler? = null
    val dao = DAO()
    var context : Context = TODO()


    private val cloudCredentials = EstimoteCloudCredentials(
        APP_ID,
        APP_TOKEN
    )

    val zoneEventViewModel by viewModels<ZoneEventViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            context = LocalContext.current
            MapViewTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colors.background
                ) {
                    //WebViewPage()
                    BeaconListView(zoneEventViewModel.zoneInfo);
                }
            }
        }
        // Requirements check
        RequirementsWizardFactory.createEstimoteRequirementsWizard().fulfillRequirements(
            this,
            onRequirementsFulfilled = { startProximityObservation(context) },
            onRequirementsMissing = displayToastAboutMissingRequirements,
            onError = displayToastAboutError
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        proximityObservationHandler?.stop()
    }

    private fun startProximityObservation(context: Context) {
        proximityObserver = ProximityObserverBuilder(applicationContext, cloudCredentials)
            .onError(displayToastAboutError)
            .withTelemetryReportingDisabled()
            .withAnalyticsReportingDisabled()
            .withEstimoteSecureMonitoringDisabled()
            .withBalancedPowerMode()
            .build()

        val proximityZones = ArrayList<ProximityZone>()
        proximityZones.add(zoneBuild("Beacon_1", context))
        proximityZones.add(zoneBuild("Beacon_2", context))
        proximityZones.add(zoneBuild("Beacon_3", context))

        proximityObservationHandler = proximityObserver.startObserving(proximityZones)
    }

    private fun zoneBuild(tag: String, context: Context): ProximityZone {
        return ProximityZoneBuilder()
            .forTag(tag).inFarRange()
            .onEnter {
                Log.d(TAG, "Enter: ${it}")
                dao.readFromDatabase(tag, context)
            }
            .onExit {
                Log.d(TAG, "Exit: ${it}")
            }
            .onContextChange {
                Log.d(TAG, "Change: ${it}")
                zoneEventViewModel.updateZoneContexts(it)
            }
            .build()
    }

    // Lambda functions for displaying errors when checking requirements
    private val displayToastAboutMissingRequirements: (List<Requirement>) -> Unit = {
        Toast.makeText(
            this,
            "Unable to start proximity observation. Requirements not fulfilled: ${it.size}",
            Toast.LENGTH_SHORT
        ).show()
    }
    private val displayToastAboutError: (Throwable) -> Unit = {
        Toast.makeText(
            this,
            "Error while trying to start proximity observation: ${it.message}",
            Toast.LENGTH_SHORT
        ).show()
    }
}

/*
@Composable
fun WebViewPage() {
    var apply: WebView
    var counter = 0
    if (counter == 0) {
        AndroidView(
            factory = {
                apply = WebView(it).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    webViewClient = WebViewClient()
                    loadUrl("file:///android_asset/index.html")
                }
                apply.settings.javaScriptEnabled = true
                apply
            },
        )
    } else {
        apply.evaluateJavascript("changeBluetooth(1)", {})
    }
}*/


@Composable
fun BeaconListView(zoneInfo: List<BeaconInfo>) {
    LazyColumn {
        items(zoneInfo) { beaconInfo ->
            Log.d(TAG, beaconInfo.toString())
        }
    }
}

//Send shit
//
