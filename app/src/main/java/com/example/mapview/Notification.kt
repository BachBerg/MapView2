package com.example.mapview

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat


class Notification(var context: Context, var title: String, var msg: String) {
    val channelID: String = "Noti123"
    val channelName: String = "Noti123Besked"

    val notificationManager =
        context.applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    lateinit var notificationChannel: NotificationChannel
    lateinit var notificationBuilder: NotificationCompat.Builder

    fun sendNotification() {
        notificationChannel =
            NotificationChannel(channelID, channelName, NotificationManager.IMPORTANCE_HIGH)
        notificationManager.createNotificationChannel(notificationChannel)

        //val intent = Intent(context,MainActivity::class.java)
        //val pendingIntent=PendingIntent.getActivities(context,0,intent,PendingIntent.FLAG_IMMUTABLE)

        notificationBuilder = NotificationCompat.Builder(context, channelID)
        notificationBuilder.setSmallIcon(R.drawable.ic_launcher_background)
        //notificationBuilder.addAction(R.drawable.ic_launcher_background,"Open Message", pendingIntent)
        notificationBuilder.setContentTitle(title)
        notificationBuilder.setContentText(msg)
        notificationBuilder.setAutoCancel(true)
        notificationManager.notify(100, notificationBuilder.build())
    }
}