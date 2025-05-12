# ChessViewer
Simple chess game viewer deployed on AWS Amplify (frontend) and AWS API Gateway + Lambda + DynamoDB (backend).

# Demo
URL: https://master.d2mlbkja551bj3.amplifyapp.com

## Purpose
* ChessViewer is a simple chess game viewer deployed on AWS Amplify (frontend) and AWS API Gateway + Lambda + DynamoDB (backend). It allows to view, analyze and interact with chess games, including making moves, viewing possible moves, and saving or loading games.
* It is designed to be a useful tool that allows users to configure game position by using tool panel in a such way:
  * **Delete** - for removing pieces (**D mode**)
  * **Edit** - for placing pieces (**E mode**)
  * **Stop** - for finishing configuration (back to **normal mode**)
* It has additional function - it allows to play chess against a computer opponent (**P mode**) or computer against computer demo (**C mode**).

## Description
* This web application handles the chess game logic and rules, including piece movement, game state management, and user interactions.
* It uses HTML elements to represent the chessboard and pieces, and it communicates with a backend API to save and load game states.
 
## Architecture 
* This web application is organized into several sections, including:
  * **Initialization**: Sets up the chessboard, pieces, and event listeners.
  * **Game Logic**: Handles the movement of pieces, checking for legal moves, and updating the game state.
  * **User Interface**: Manages the display of messages, game state, and user interactions.
  * **API Communication**: Interacts with a backend API to save and load game states.
  * **Event Handlers**: Responds to user actions, such as clicking on pieces or fields, and updates the game state accordingly.
  * **Utility Functions**: Provides helper functions for common tasks, such as updating the display or checking game conditions.
* It includes features such as:
  * Chessboard setup with draggable pieces.
  * Piece movement and legal move checking.
  * Game state management (saving and loading games).
  * User interface for displaying game status and messages.
  * API communication for saving and loading game states.

## Dependencies
  * HTML elements and CSS styles for the chessboard and pieces.
  * JavaScript for event handling and game logic.
  * A backend API for saving and loading game states.
  * AWS SDK for JavaScript (v3).
  * DynamoDB Document Client for storing games data.

## Functionalities

### 1. Viewing Chess Games
- **Chessboard Display**: The application displays a chessboard with all the pieces in their initial positions.
- **Piece Movement**: Users can click on pieces to see possible moves and move them to valid positions.
- **Move Highlighting**: Possible moves for a selected piece are highlighted on the board.

### 2. Game Interaction
- **Making Moves**: Users can make moves by clicking on a piece and then clicking on a valid destination field.
- **Undo Moves**: Users can undo the last move made.
- **Redo Moves**: Users can redo moves that were undone.
- **Move History**: The application keeps track of all moves made during the game and displays them in a move history panel.

### 3. Game Modes
- **Player vs Computer**: Users can play against the computer.
- **Computer vs Computer**: The application can simulate a game between two computer players.
- **Player vs Player**: Two users can play against each other on the same device.

### 4. Special Moves
- **Castling**: The application supports castling moves for both white and black players.
- **En Passant**: The application supports en passant captures.
- **Pawn Promotion**: When a pawn reaches the opposite end of the board, it can be promoted to a queen, rook, bishop, or knight.

### 5. Game Saving and Loading
- **Save Game**: Users can save the current state of the game to the server.
- **Load Game**: Users can load a previously saved game from the server.
- **Game List**: The application displays a list of saved games that users can select from to load.

### 6. Game Analysis
- **Check Detection**: The application detects when a king is in check and highlights the checking piece.
- **Checkmate Detection**: The application detects checkmate situations and ends the game.
- **Stalemate Detection**: The application detects stalemate situations and ends the game.

### 7. User Interface
- **Responsive Design**: The application is designed to work on various screen sizes, including desktops, tablets, and mobile devices.
- **User Feedback**: The application provides feedback messages to the user for various actions, such as making a move, saving a game, or detecting check and checkmate.

### 8. Backend API
- **Game Storage**: The backend API allows for storing and retrieving game states.
- **Game Retrieval**: Users can retrieve a list of saved games and load a specific game by its ID.
- **Game Saving**: Users can save the current game state to the server, including the move history and player details.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For any questions or feedback, please contact Andrzej Żukowski at [andrzuk@gmail.com](mailto:andrzuk@gmail.com).
