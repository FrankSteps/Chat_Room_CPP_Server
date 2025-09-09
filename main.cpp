/*
    Server developed by: Francisco Passos | Frank Steps
    
    Developed in: 03/09/2025
    Modified in: 09/09/2025

    Learning the httplib library with C++ <3

    Use to execute this program in your Linux/Windows/MacOS:
    
    1. Compile all sources together:
        g++ -std=c++17 main.cpp server.cpp window.cpp -o server -I. -lraylib -lm -ldl -lpthread -lGL -lrt -lX11
    
    2. Run the server:
        ./server

    File purposes:
        - main.cpp   : entry point, manages initialization and control flow
        - server.cpp : handles HTTP server with httplib
        - window.cpp : handles Raylib window for chat interface
        - shared.h   : shared declarations and global variables
*/

//libraries
#include "shared.h"
#include <thread>

// Global variable definition
std::string localIP; // defined once

int main(){
    // Initialize the global IP variable
    localIP = ip_local();

    // Start server in a separate thread
    std::thread serverThread(startServer);

    // Start window in the main thread
    if (windowOpen) {
        startWindow();
    }

    // Wait for the server thread to finish
    serverThread.join();
    return EXIT_SUCCESS;
}

