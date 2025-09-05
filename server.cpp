/*
    This program is a server settings
*/

//libraries and c++ programs imports
#include "shared.h"
#include "httplib.h"
#include <thread>

//do you want open window?
const bool windowOpen = true;

void hashtag() {
    std::cout << "##########################################################################\n";
}

//start settings this server
int startServer(){
    httplib::Server server;

    std::cout << "Loading server\n";
    server.set_mount_point("/", "./server_documents");

    server.Post("/send", [](const httplib::Request& req, httplib::Response& res){
        //requests of site
        auto user = req.get_param_value("user");
        auto msg = req.get_param_value("message");

        //show user and your message in the prompt
        std::cout << "user: " << user << " || "<< "message: " << msg << '\n';

        //return cpp to html
        res.set_content(
            "<h2>Message received</h2>"
            "<p>Username: " + user + "</p>"
            "<a href='/'>Back</a>", "text/html"
        );
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
