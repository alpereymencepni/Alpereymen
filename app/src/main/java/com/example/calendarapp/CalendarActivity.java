package com.example.calendarapp;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CalendarView;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Spinner;
import java.util.ArrayList;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.NotificationManagerCompat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class CalendarActivity extends AppCompatActivity {

    private List<Arrangement> arrangementList;
    private ArrayAdapter<String> adapter;
    private CalendarView calendarView;
    private Date selectedDate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_calendar);

        arrangementList = DataManager.loadArrangements(this);
        ListView arrangementListView = findViewById(R.id.arrangement_list);
        Button addArrangementButton = findViewById(R.id.add_arrangement_button);
        calendarView = findViewById(R.id.calendarView);

        // Initialize with today's date
        selectedDate = new Date(calendarView.getDate());

        calendarView.setOnDateChangeListener(new CalendarView.OnDateChangeListener() {
            @Override
            public void onSelectedDayChange(CalendarView view, int year, int month, int dayOfMonth) {
                Calendar calendar = Calendar.getInstance();
                calendar.set(year, month, dayOfMonth);
                selectedDate = calendar.getTime();
                updateArrangementList();
            }
        });

        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, new ArrayList<String>());
        arrangementListView.setAdapter(adapter);
        updateArrangementList();

        addArrangementButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showAddArrangementDialog();
            }
        });
    }

    private void showAddArrangementDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = this.getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_add_arrangement, null);
        builder.setView(dialogView);

        final EditText arrangementTitle = dialogView.findViewById(R.id.arrangement_title);
        final Spinner departmentSpinner = dialogView.findViewById(R.id.department_spinner);

        List<Department> departmentList = DataManager.loadDepartments(this);
        List<String> departmentNames = new ArrayList<>();
        for (Department department : departmentList) {
            departmentNames.add(department.getName());
        }

        ArrayAdapter<String> spinnerAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, departmentNames);
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        departmentSpinner.setAdapter(spinnerAdapter);

        builder.setPositiveButton("Add", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String title = arrangementTitle.getText().toString();
                String department = departmentSpinner.getSelectedItem().toString();
                if (!title.isEmpty()) {
                    Arrangement newArrangement = new Arrangement(title, selectedDate, department);
                    arrangementList.add(newArrangement);
                    updateArrangementList();
                    scheduleNotification(newArrangement);
                    DataManager.saveArrangements(CalendarActivity.this, arrangementList);
                }
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel();
            }
        });

        builder.show();
    }

    private void updateArrangementList() {
        adapter.clear();
        Calendar selectedCal = Calendar.getInstance();
        selectedCal.setTime(selectedDate);
        for (Arrangement arrangement : arrangementList) {
            Calendar arrangementCal = Calendar.getInstance();
            arrangementCal.setTime(arrangement.getDate());
            if (selectedCal.get(Calendar.YEAR) == arrangementCal.get(Calendar.YEAR) &&
                selectedCal.get(Calendar.MONTH) == arrangementCal.get(Calendar.MONTH) &&
                selectedCal.get(Calendar.DAY_OF_MONTH) == arrangementCal.get(Calendar.DAY_OF_MONTH)) {
                adapter.add(arrangement.getTitle());
            }
        }
        adapter.notifyDataSetChanged();
    }

    private void scheduleNotification(Arrangement arrangement) {
        Intent intent = new Intent(this, NotificationReceiver.class);
        intent.putExtra("title", "Upcoming Arrangement");
        intent.putExtra("message", arrangement.getTitle());
        intent.putExtra("notificationId", arrangement.hashCode());

        PendingIntent pendingIntent = PendingIntent.getBroadcast(this, arrangement.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT);
        AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(arrangement.getDate());
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);

        alarmManager.set(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(), pendingIntent);
    }
}
