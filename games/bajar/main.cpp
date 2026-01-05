#include <emscripten.h>
#include "gamevars.h"

EM_JS(void, win, (), {
  window.parent.location.href = '../../../pages/9JQQX.html';
  throw 'all done';
});

EM_JS(void, lose, (), {
  window.parent.location.href = '../../../pages/ZWHG7.html';
  throw 'all done';
});

int main(int argc, char *argv[]) {
    InitWindow(WID, HGT, "game");
    SetTargetFPS(60);
    Font fa_solid = LoadFontEx("../include/fa-solid.ttf", ICON_HGT, codepoints, ICON_MAX);

    grid[0][0] = ICON_HEART;
    grid[2][0] = ICON_FLAG;
    grid[water_y][water_x] = ICON_WATER_BOTTLE;
    grid[4][1] = ICON_EQUALS;
    grid[4][2] = ICON_W;

    for (int i = 0; i < 4; i++) {
        while (true) {
            int x = GetRandomValue(1, GRID_X - 1);
            int y = GetRandomValue(1, GRID_Y - 2);
            if (grid[y][x] == ICON_FLAG)
                continue;
            grid[y][x] = ICON_FLAG;
            break;
        }
    }
    
    gen_grid();

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(WHITE);

        Vector2 touch = GetTouchPosition(0);
        Vector2 mouse = GetMousePosition();

        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) || GetGestureDetected() == GESTURE_TAP) {
            for (int i = player_x - 1; i <= player_x + 1; i++)
                for (int j = player_y - 1; j <= player_y + 1; j++) {
                    Rectangle r = (Rectangle){(float)(i * ICON_WID + (i + 1) * ICON_GAP), 
                                            (float)(j * ICON_HGT + (j + 1) * ICON_GAP), 
                                            (float)ICON_WID, 
                                            (float)ICON_HGT};
                    if (CheckCollisionPointRec(touch, r) || CheckCollisionPointRec(mouse, r)) {
                        if (j == GRID_Y - 1) {
                            if (flags != 0)
                                continue;
                            win();
                        }
                        if (j == 0 && player_y > 0)
                            continue;
                        player_x = i;
                        player_y = j;
                        int icon = grid[j][i];
                        if (icon == ICON_BOMB) {
                            hearts--;
                            if (hearts == 0)
                                lose();
                            gen_grid();
                        }
                        if (icon == ICON_FLAG) {
                            grid[j][i] = ICON_NONE;
                            flags--;
                            gen_grid();
                        }
                    }
                }           
                
            if (waters > 0 && (CheckCollisionPointRec(touch, water_rect) || CheckCollisionPointRec(mouse, water_rect))) {
                waters--;
                hearts = 2;
            }
        }
        
        grid[1][0] = ICON_0 + hearts;
        grid[3][0] = ICON_0 + flags;
        grid[5][0] = ICON_0 + waters;
        
        DrawRectangle(0, 0, WID, ICON_HGT + 2 * ICON_GAP, SKYBLUE);
        DrawRectangle(0, HGT - ICON_HGT - 2 * ICON_GAP, WID, ICON_HGT + 2 * ICON_GAP, DARKGREEN);
        DrawRectangle(0, 0, ICON_WID + 2 * ICON_GAP, HGT, BLACK);
        
        for (int i = 0; i < GRID_X; i++)
          for (int j = 0; j < GRID_Y; j++) {
            int icon = (i == player_x && j == player_y) ? ICON_AT : grid[j][i];
            int wid = fa_solid.glyphs[icon].advanceX;
            int padding = (ICON_WID - wid) / 2;
            DrawTextCodepoint(fa_solid, 
                              codepoints[icon], 
                              (Vector2){(float)(padding + i * ICON_WID + (i + 1) * ICON_GAP), 
                                        (float)(j * ICON_HGT + (j + 1) * ICON_GAP)}, 
                              ICON_HGT, 
                              icon_colors[icon]);
          }

        EndDrawing();
    }
    CloseWindow();
    return 0;
}
