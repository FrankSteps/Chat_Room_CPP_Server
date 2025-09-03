/*
    Server developed by: Francisco Passos | Frank Steps
    
    Developed in: 03/09/2025
    Modified in: 03/09/2025

    Learning the httplib library with C++ <3
*/

//Libraries
#include <iostream>
#include <ifaddrs.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <string>
#include <memory>
#include "httplib.h"

/*
*(!) I will use it here in the future 

namespace ray {
    #include <raylib.h>
}
*/

//Function to discover the local IP (IPv4) in string format
std::string ip_local(){
    struct ifaddrs *ifaddr, *ifa;
    std::string ip = "127.0.0.1"; //defined the default value to IP 

    //
    if(getifaddrs(&ifaddr) == -1){
        perror("getifaddrs");
        return ip; //return the default value if error
    }

    //traverse all interfaces ignoring those without an active/valid/existing IP
    for(ifa = ifaddr; ifa != nullptr; ifa = ifa->ifa_next){
        if (ifa->ifa_addr == nullptr) {
            continue;
        }
        
        //Just consider IPv4 interfaces; convert binary value to string
        if(ifa->ifa_addr->sa_family == AF_INET){
            struct sockaddr_in *sa = (struct sockaddr_in *) ifa->ifa_addr;
            char buffer[INET_ADDRSTRLEN];
            inet_ntop(AF_INET, &(sa->sin_addr), buffer, INET_ADDRSTRLEN);
        
            //return the first valid IP as long as it isn't the default IP
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

//basic server settings (and window configuration - in the future)
int main(){
    httplib::Server server;

    std::cout << "Loading server\n";
    server.set_mount_point("/", "./server_documents");

    server.Post("/send", [](const httplib::Request& req, httplib::Response& res){
        auto msg = req.get_param_value("message");
        std::cout << "message: " << msg << '\n';

        res.set_content("<h2>Message received</h2> <p> </p><a href='/'>Back</a>", "text/html");
    });

    //messages indicating server operation
    std::cout << "The local IP of this computer is:" << ip_local() << '\n';
    std::cout << "access from your computer using: http://localhost:8080\n";
    std::cout << "access from another device using: http://" << ip_local() << ":8080\n";

    //server started:
    server.listen("0.0.0.0", 8080);
}