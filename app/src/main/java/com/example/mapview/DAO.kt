package com.example.mapview

import android.content.Context
import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore

/* data access objekt
* This class manages communication with firebase */

class DAO {
    var db: FirebaseFirestore = FirebaseFirestore.getInstance()
    private val TAG = "DatabaseObject"

    fun readFromDatabase(Document: String, context: Context) {
        val docRef = db.collection("Beacons").document(Document)
        docRef.get()
            .addOnSuccessListener() { document ->
                if (document != null) {
                    Log.d(TAG, "Data: ${document.data}")
                    val notish = Notification(context, "BeaconNumber", "${document.data}")
                    notish.sendNotification()
                } else {
                    Log.d(TAG, "Dokumentet findes ikke ")
                }
            }
            .addOnFailureListener { exception ->
                Log.d(TAG, "Dokumentet fejlede pga. ", exception)
            }
    }
}