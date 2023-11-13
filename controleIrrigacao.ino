#include <ESP8266WiFi.h>
#include <cstdlib>

extern "C"
{
#include "user_interface.h"
}

// Credentials
#define WIFI_SSID "SSID"
#define WIFI_PASSWORD "PSSWD"
#define API_KEY "XXXXXXXXXXXXX"
#define SERVER "api.thingspeak.com"

os_timer_t mTimer;
bool _timeout = false;

WiFiClient client;

int PinoAnalogico = A0;
int PinoDigital = D2;
int Rele = D1;
int EstadoSensor = 0;
int UltimoEstSensor = 0;
int ValAnalogIn;

void tCallback(void *tCall)
{
    _timeout = true;
}

void usrInit(void)
{
    os_timer_setfn(&mTimer, tCallback, NULL);
    os_timer_arm(&mTimer, 1000, true);
}

void initWiFi()
{
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi ..");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print("Conectando");
        delay(1000);
    }
    Serial.println(WiFi.localIP());
    delay(2000);
    Serial.println();
}

void setup()
{
    Serial.begin(9600);
    initWiFi();
    usrInit();
    pinMode(Rele, OUTPUT);
    pinMode(PinoDigital, INPUT);
}

void loop()
{
    if (_timeout)
    {
        ValAnalogIn = analogRead(PinoAnalogico);
        int Porcento = map(ValAnalogIn, 515, 1023, 100, 0);

        Serial.print("Umidade: ");
        Serial.print(Porcento);
        Serial.println("%");

        if (Porcento <= 60)
        {
            Serial.println("Irrigando Planta");
            EstadoSensor = 0; // Define o estado como desarmado
            digitalWrite(Rele, LOW);
        }
        else
        {
            Serial.println("Planta Irrigada");
            EstadoSensor = 1; // Define o estado como armado
            digitalWrite(Rele, HIGH);
        }

        if (client.connect(SERVER, 80))
        {
            String postStr = "api_key=";
            postStr += API_KEY;
            postStr += "&field1=";
            postStr += String(Porcento);
            postStr += "&field2=";
            postStr += String(EstadoSensor); // Use o EstadoSensor no campo field2

            client.print("POST /update HTTP/1.1\n");
            client.print("Host: api.thingspeak.com\n");
            client.print("Connection: close\n");
            client.print("X-THINGSPEAKAPIKEY: ");
            client.print(API_KEY);
            client.print("\n");
            client.print("Content-Type: application/x-www-form-urlencoded\n");
            client.print("Content-Length: ");
            client.print(postStr.length());
            client.print("\n\n");
            client.print(postStr);

            Serial.print("Umidade enviada para ThingSpeak: ");
            Serial.println(Porcento);
        }

        client.stop();
        _timeout = false;
    }
}
