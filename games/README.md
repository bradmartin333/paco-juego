# C++ RayLib WASM build setup

emscripten
- `cd ~`
- `git clone https://github.com/emscripten-core/emsdk.git`
- `cd emsdk/`
- `./emsdk install latest`
- `./emsdk activate latest`

RayLib
- Install deps
  - `sudo apt install vlc libasound2-dev libx11-dev libxrandr-dev libxi-dev libgl1-mesa-dev libglu1-mesa-dev libxcursor-dev libxinerama-dev`
- `cd ~`
- `git clone https://github.com/raysan5/raylib.git raylib`
- `cd raylib`
- `mkdir build && cd build`
- `cmake -DBUILD_SHARED_LIBS=ON ..`
- `make`
- `sudo make install`
- `export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib`
- `export DISPLAY=:0`
- Edit /home/$USER/raylib/src/Makefile
- Update EMSDK_PATH to be /home/$(USER)/emsdk
- `source ~/emsdk/emsdk_env.sh` to activate emsdk environment variables
- `cd ~/raylib/src`
- `make PLATFORM=PLATFORM_WEB`

Run `../build.sh` from withing a game directory or `g++ main.cpp -lraylib -o test` for a test build
