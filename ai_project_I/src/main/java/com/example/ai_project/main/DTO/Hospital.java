package com.example.ai_project.main.DTO;

public class Hospital {
    private String place_name;       // 병원명
    private String road_address_name; // 주소

    // getter / setter
    public String getPlace_name() {
        return place_name;
    }
    public void setPlace_name(String place_name) {
        this.place_name = place_name;
    }
    public String getRoad_address_name() {
        return road_address_name;
    }
    public void setRoad_address_name(String road_address_name) {
        this.road_address_name = road_address_name;
    }
}