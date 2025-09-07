/*
    This program is a server settings
*/

//libraries and c++ programs imports
#include "shared.h"
#include "httplib.h"
#include <iomanip>
#include <thread>
#include <vector>
#include <ctime>

//do you want open window?
const bool windowOpen = true;

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

struct infoUser {
    std::string user;
    std::string text;
    std::string color;
    std::string date;
};

std::vector<infoUser> messages; 

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
        auto color = req.get_param_value("color");

        //show user and your message in the prompt
        //save message
        infoUser m;
        m.user = user;
        m.text = msg;
        m.color = color;

        bool found = false;
        for(auto& oldMsg : messages){
            if(oldMsg.user == user){
                m.date = oldMsg.date;
                found = true;
                break;
            }
        }

        if (!found) {
            m.date = std::to_string(std::time(nullptr));
        }

        messages.push_back(m);

        //atual hour and atual date 
        std::time_t t = std::stoll(m.date);
        std::tm* tm_ptr = std::localtime(&t);

        //to Server from console - "debug"
        std::cout << "user: " << user << " || " << "message: " << msg << " || " << "favColor: " << color << " || " << std::put_time(tm_ptr, "%d/%m/%y %H:%M:%S") << '\n';

        //return cpp to html
        res.set_content("OK", "text/plain");
    });

    //response - convert to JSON format
    server.Get("/messages", [&](const httplib::Request& req, httplib::Response& res){
        std::string json = "[";
        for(size_t i = 0; i < messages.size(); i++){
            json += "{";
            json += "\"user\":\"" + escape_json(messages[i].user) + "\",";
            json += "\"text\":\"" + escape_json(messages[i].text) + "\",";
            json += "\"color\":\"" + escape_json(messages[i].color) + "\",";
            json += "\"date\":\"" + escape_json(messages[i].date) + "\"";
            json += "}";
            if(i != messages.size()-1) json += ",";
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
