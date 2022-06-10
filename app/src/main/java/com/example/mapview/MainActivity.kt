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
import com.estimote.mustard.rx_goodness.rx_requirements_wizard.Requirement
import com.estimote.mustard.rx_goodness.rx_requirements_wizard.RequirementsWizardFactory
import com.estimote.proximity_sdk.api.*
import com.example.mapview.CloudCredentials.APP_ID
import com.example.mapview.CloudCredentials.APP_TOKEN
import com.example.mapview.ui.theme.MapViewTheme

private const val TAG = "PROXIMITY"

class MainActivity : ComponentActivity() {

    private lateinit var proximityObserver: ProximityObserver
    private var proximityObservationHandler: ProximityObserver.Handler? = null
    val dao = DAO()

    private val cloudCredentials = EstimoteCloudCredentials(
        APP_ID,
        APP_TOKEN
    )

    val zoneEventViewModel by viewModels<ZoneEventViewModel>()

    /* The onCreate function is responsible for application setup when first deployed*/

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            //  context = LocalContext.current
            MapViewTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colors.background
                ) {
                    BeaconListView(zoneEventViewModel.zoneInfo)
                }
            }
        }
        // Requirements check
        RequirementsWizardFactory.createEstimoteRequirementsWizard().fulfillRequirements(
            this,
            onRequirementsFulfilled = { startProximityObservation(this) },
            onRequirementsMissing = displayToastAboutMissingRequirements,
            onError = displayToastAboutError
        )
    }

    /* The onDestroy function is run when the app is terminated */

    override fun onDestroy() {
        super.onDestroy()
        proximityObservationHandler?.stop()
    }

    /* This function creates both the proximityObserver and each proximity zone using the zoneBuild method */

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
            .forTag(tag).inCustomRange(10.1)
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

/* BeaconListView is responsible for managing the dynamic list that contains the beacon info */

@Composable
fun BeaconListView(zoneInfo: List<BeaconInfo>) {
    LazyColumn {
        items(zoneInfo) { beaconInfo ->
            Log.d(TAG, beaconInfo.toString())
        }
    }
}