package com.example.calendarapp;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import java.util.ArrayList;
import java.util.List;

public class DepartmentActivity extends AppCompatActivity {

    private List<Department> departmentList;
    private ArrayAdapter<String> adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_department);

        departmentList = DataManager.loadDepartments(this);
        ListView departmentListView = findViewById(R.id.department_list);
        Button addDepartmentButton = findViewById(R.id.add_department_button);

        List<String> departmentNames = new ArrayList<>();
        for (Department department : departmentList) {
            departmentNames.add(department.getName());
        }

        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, departmentNames);
        departmentListView.setAdapter(adapter);

        addDepartmentButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showAddDepartmentDialog();
            }
        });
    }

    private void showAddDepartmentDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Add Department");

        final EditText input = new EditText(this);
        builder.setView(input);

        builder.setPositiveButton("Add", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String departmentName = input.getText().toString();
                if (!departmentName.isEmpty()) {
                    departmentList.add(new Department(departmentName));
                    adapter.add(departmentName);
                    adapter.notifyDataSetChanged();
                    DataManager.saveDepartments(DepartmentActivity.this, departmentList);
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
}
