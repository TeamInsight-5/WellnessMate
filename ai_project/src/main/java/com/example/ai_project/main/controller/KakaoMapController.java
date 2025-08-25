package com.example.ai_project.main.controller;

import com.example.ai_project.main.DTO.Hospital;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.json.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/map")
public class KakaoMapController {

    private final String KAKAO_API_KEY = "3d110650cbc7ad58dd9cab786232f4f0";

    @GetMapping("/hospitals")
    public List<Hospital> getHospitals(@RequestParam String address) {
        List<Hospital> hospitals = new ArrayList<>();
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. 주소 → 좌표 변환
            String coordUrl = "https://dapi.kakao.com/v2/local/search/address.json?query=" + address;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + KAKAO_API_KEY);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> coordResponse = restTemplate.exchange(coordUrl, HttpMethod.GET, entity, String.class);
            JSONObject coordJson = new JSONObject(coordResponse.getBody());
            JSONArray coordDocuments = coordJson.getJSONArray("documents");

            if (coordDocuments.length() == 0) return hospitals; // 검색 실패

            String x = coordDocuments.getJSONObject(0).getString("x");
            String y = coordDocuments.getJSONObject(0).getString("y");

            // 2. 좌표 기반 내과 검색
            String url = "https://dapi.kakao.com/v2/local/search/keyword.json?query=내과&x=" + x + "&y=" + y + "&radius=5000&size=10";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            JSONObject json = new JSONObject(response.getBody());
            JSONArray documents = json.getJSONArray("documents");

            for (int i = 0; i < documents.length(); i++) {
                JSONObject obj = documents.getJSONObject(i);
                Hospital hospital = new Hospital();
                hospital.setPlace_name(obj.getString("place_name"));
                hospital.setRoad_address_name(obj.optString("road_address_name", ""));
                hospitals.add(hospital);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return hospitals;
    }

    @GetMapping("/hospital_sur")
    public List<Hospital> getHospitalSurgery(@RequestParam String address) {
        List<Hospital> hospitals = new ArrayList<>();
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. 주소 → 좌표 변환
            String coordUrl = "https://dapi.kakao.com/v2/local/search/address.json?query=" + address;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + KAKAO_API_KEY);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> coordResponse = restTemplate.exchange(coordUrl, HttpMethod.GET, entity, String.class);
            JSONObject coordJson = new JSONObject(coordResponse.getBody());
            JSONArray coordDocuments = coordJson.getJSONArray("documents");

            if (coordDocuments.length() == 0) return hospitals; // 검색 실패

            String x = coordDocuments.getJSONObject(0).getString("x");
            String y = coordDocuments.getJSONObject(0).getString("y");

            // 2. 좌표 기반 내과 검색
            String url = "https://dapi.kakao.com/v2/local/search/keyword.json?query=외과&x=" + x + "&y=" + y + "&radius=5000&size=10";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            JSONObject json = new JSONObject(response.getBody());
            JSONArray documents = json.getJSONArray("documents");

            for (int i = 0; i < documents.length(); i++) {
                JSONObject obj = documents.getJSONObject(i);
                Hospital hospital = new Hospital();
                hospital.setPlace_name(obj.getString("place_name"));
                hospital.setRoad_address_name(obj.optString("road_address_name", ""));
                hospitals.add(hospital);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return hospitals;
    }
}