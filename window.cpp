/*
    This program will be a Chat app

    Chat UP!
*/

#include "shared.h"

namespace ray {
    #include <raylib.h>
}

void startWindow(){
    //window configuration - program for chat
    ray::InitWindow(720, 480, "Bate-papo C(hat)++");

    //icon this program
    ray::Image icon = ray::LoadImage("server_documents/images/icons/icon_user.png");
    ray::SetWindowIcon(icon);

    //window configuration with raylib
    while(!ray::WindowShouldClose()){
        ray::BeginDrawing();
        int y = 20;
        ray::DrawText("The local IP of this computer is:", 20, y, 20, ray::LIGHTGRAY); y += 30;
        ray::DrawText(localIP.c_str(), 20, y, 20, ray::LIGHTGRAY); y += 30;
        ray::DrawText("Access from your computer using: http://localhost:3000", 20, y, 20, ray::LIGHTGRAY); y += 30;
        ray::DrawText(("Access from another device using: http://" + localIP + ":3000").c_str(), 20, y, 20, ray::LIGHTGRAY); y += 30;
        ray::DrawText("Press Ctrl+C to stop.", 20, y, 20, ray::LIGHTGRAY);
        ray::EndDrawing();
    }
    ray::UnloadImage(icon);
    ray::CloseWindow();
}
