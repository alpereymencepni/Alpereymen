package com.example.calendarapp;

import java.util.Date;

public class Arrangement {
    private String title;
    private Date date;
    private String department;

    public Arrangement(String title, Date date, String department) {
        this.title = title;
        this.date = date;
        this.department = department;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
