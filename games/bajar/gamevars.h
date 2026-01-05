#include <raylib.h>

#define NUM_RANDOM 6

constexpr int WID = 320;
constexpr int HGT = 240;
constexpr int GRID_X = 7;
constexpr int GRID_Y = 6;
constexpr int ICON_GAP = 5;
constexpr int ICON_WID = (WID - (GRID_X + 1) * ICON_GAP) / GRID_X - ICON_GAP / GRID_X;
constexpr int ICON_HGT = (HGT - (GRID_Y + 1) * ICON_GAP) / GRID_Y - ICON_GAP / GRID_Y;

enum Icon {
  ICON_NONE,
  ICON_WATER_BOTTLE,
  ICON_AT,
  ICON_BOMB,
  ICON_HEART,
  ICON_0,
  ICON_1,
  ICON_2,
  ICON_3,
  ICON_4,
  ICON_W,
  ICON_EQUALS,
  ICON_FLAG,
  ICON_MAX,
};

int codepoints[ICON_MAX] = {
  0x0,
  0xe4c5,
  0x40,
  0xf1e2,
  0xf004,
  0x30,
  0x31,
  0x32,
  0x33,
  0x34,
  0x57,
  0x3d,
  0xf024,
};

Color icon_colors[ICON_MAX] = {
  WHITE,
  BLUE,
  BLACK,
  GOLD,
  RED,
  WHITE,
  WHITE,
  WHITE,
  WHITE,
  WHITE,
  BLUE,
  BLACK,
  GREEN,
};

int grid[GRID_Y][GRID_X];
Rectangle rects[GRID_Y][GRID_X];
int hearts = 2;
int flags = 4;
int waters = 2;
int player_x = 5;
int player_y = 0;
constexpr int water_x = 0;
constexpr int water_y = 4;
Rectangle water_rect = (Rectangle){(float)(water_x * ICON_WID + (water_x + 1) * ICON_GAP), 
                                   (float)(water_y * ICON_HGT + (water_y + 1) * ICON_GAP), 
                                   (float)ICON_WID, 
                                   (float)ICON_HGT};  

int lost_nums[NUM_RANDOM] = {4, 8, 15, 16, 23, 42};
void gen_grid() {
  unsigned int random_number = GetRandomValue(0, NUM_RANDOM);
  for (int i = 1; i < GRID_X; i++)
    for (int j = 1; j < GRID_Y - 1; j++) {
      if (grid[j][i] == ICON_FLAG)
        continue;
      grid[j][i] = ICON_NONE;
      if (i == player_x && j == player_y)
        continue;
      if (lost_nums[random_number] % 2 == 0)
        grid[j][i] = ICON_BOMB;
      random_number++;
      if (random_number > NUM_RANDOM)
        random_number = 0;
    }      
}

