#ifndef SHARED_H
#define SHARED_H

//libraries
#include <iostream>
#include <ifaddrs.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <string>

//Global variables here
extern const bool windowOpen;
extern std::string localIP;

//Function to discover the local IP (IPv4) in string format
inline std::string ip_local(){
    struct ifaddrs *ifaddr, *ifa;
    std::string ip = "127.0.0.1"; //defined the default value to IP 
  
    if(getifaddrs(&ifaddr) == -1){
        perror("getifaddrs");
        return ip; //return the default value if error
    }

    //traverse all interfaces ignoring those without an active/valid/existing IP
    for(ifa = ifaddr; ifa != nullptr; ifa = ifa->ifa_next){
        if (ifa->ifa_addr == nullptr){
            continue;
        }
        
        //Just consider IPv4 interfaces; convert binary value to string
        if(ifa->ifa_addr->sa_family == AF_INET){
            struct sockaddr_in *sa = (struct sockaddr_in *) ifa->ifa_addr;
            char buffer[INET_ADDRSTRLEN];
            inet_ntop(AF_INET, &(sa->sin_addr), buffer, INET_ADDRSTRLEN);
        
            if(std::string(buffer) != "127.0.0.1") {
                ip = buffer;
                break;
            }
        }
    }
    //release memory and return the actived interface's IP
    freeifaddrs(ifaddr);
    return ip;
}

//functions here:
void hashtag();
int startServer();
void startWindow();

#endif
