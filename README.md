# ChessViewer
Simple chess game viewer deployed on AWS Amplify (frontend) and AWS API Gateway + Lambda + DynamoDB (backend).
# Demo
URL: https://master.d2mlbkja551bj3.amplifyapp.com

## Purpose

ChessViewer is a simple chess game viewer deployed on AWS Amplify (frontend) and AWS API Gateway + Lambda + DynamoDB (backend). It allows to view, analyze and interact with chess games, including making moves, viewing possible moves, and saving or loading games.

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
