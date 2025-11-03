package com.example.calendarapp;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class DataManager {
    private static final String PREFS_NAME = "CalendarAppPrefs";
    private static final String DEPARTMENTS_KEY = "departments";
    private static final String ARRANGEMENTS_KEY = "arrangements";
    private static Gson gson = new Gson();

    public static void saveDepartments(Context context, List<Department> departments) {
        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
        String json = gson.toJson(departments);
        editor.putString(DEPARTMENTS_KEY, json);
        editor.apply();
    }

    public static List<Department> loadDepartments(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(DEPARTMENTS_KEY, null);
        Type type = new TypeToken<ArrayList<Department>>() {}.getType();
        List<Department> departments = gson.fromJson(json, type);
        if (departments == null) {
            departments = new ArrayList<>();
        }
        return departments;
    }

    public static void saveArrangements(Context context, List<Arrangement> arrangements) {
        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
        String json = gson.toJson(arrangements);
        editor.putString(ARRANGEMENTS_KEY, json);
        editor.apply();
    }

    public static List<Arrangement> loadArrangements(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(ARRANGEMENTS_KEY, null);
        Type type = new TypeToken<ArrayList<Arrangement>>() {}.getType();
        List<Arrangement> arrangements = gson.fromJson(json, type);
        if (arrangements == null) {
            arrangements = new ArrayList<>();
        }
        return arrangements;
    }
}
