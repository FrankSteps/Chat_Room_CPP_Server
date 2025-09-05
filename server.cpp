/*
    This program is a server settings
*/

//libraries and c++ programs imports
#include "shared.h"
#include "httplib.h"
#include <thread>
#include <vector>

//do you want open window?
const bool windowOpen = false;

std::vector<std::string> messages; 

void hashtag() {
    std::cout << "##########################################################################\n";
}

// This function converts multiple lines and special characters (incompatible with JSON) into a JSON-compatible format
std::string escape_json(const std::string& s) {
    std::string out;
    for (char c : s) {
        switch (c) {
            case '\"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\b': out += "\\b"; break;
            case '\f': out += "\\f"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default:
                if (c >= 0 && c <= 0x1F) {
                    char buf[7];
                    snprintf(buf, sizeof(buf), "\\u%04x", c);
                    out += buf;
                } else {
                    out += c;
                }
        }
    }
    return out;
}

//start settings this server
int startServer(){
    httplib::Server server;

    std::cout << "Loading server\n";
    server.set_mount_point("/", "./server_documents");

    //requests
    server.Post("/send", [](const httplib::Request& req, httplib::Response& res){
        //requests of site
        auto user = req.get_param_value("user");
        auto msg = req.get_param_value("message");

        //show user and your message in the prompt
        std::cout << "user: " << user << " || "<< "message: " << msg << '\n';
        
        //save message
        messages.push_back(user + ": " + msg);

        //return cpp to html
        res.set_content("OK", "text/plain");
    });

    //response
    server.Get("/messages", [&](const httplib::Request& req, httplib::Response& res){
        std::string json = "[";
        for(size_t i = 0; i < messages.size(); i++){
            json += "{\"text\":\"" + escape_json(messages[i]) + "\"}";

            if(i != messages.size()-1) {
                json += ",";
            }
        }
        json += "]";
        res.set_content(json, "application/json");
    });


    //init server in a thread
    std::thread initServer([&server](){
        server.listen("0.0.0.0", 8080);
    });

    if (windowOpen) {          
        initServer.join(); 
    } else {
        hashtag();
        std::cout << "Press Ctrl+C to stop.\n";
        initServer.join();
    }

    //messages indicating server operation
    hashtag();
    std::cout << "The local IP of this computer is: " << ip_local() << '\n';
    std::cout << "access from your computer using: http://localhost:8080\n";
    std::cout << "access from another device using: http://" << ip_local() << ":8080\n";

    return EXIT_SUCCESS;
}
