package com.productiv.workmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WorkManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkManagementApplication.class, args);
    }
}
