package com.example.mapview

import android.util.Log
import androidx.compose.ui.platform.LocalContext
import com.google.firebase.firestore.FirebaseFirestore

class DAO {
    var db: FirebaseFirestore = FirebaseFirestore.getInstance()
    private val TAG = "DatabaseObject"
    val sad: String


    fun readFromDatabase(Document : String){
    val docRef = db.collection("Beacons").document(Document)
    docRef.get()
        .addOnSuccessListener() { document ->
            if (document != null) {
                Log.d(TAG, "Data: ${document.data}")
            } else {
                Log.d(TAG, "Dokumentet findes ikke ")
            }
        }
        .addOnFailureListener { exception ->
            Log.d(TAG, "Dokumentet fejlede pga. ", exception)
        }
}
}