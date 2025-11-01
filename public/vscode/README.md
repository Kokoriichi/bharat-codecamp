# VS Code Web Integration

## Setup Instructions

To integrate the full VS Code web client:

1. **Build VS Code Web** (on your local machine):
   ```bash
   git clone https://github.com/microsoft/vscode.git
   cd vscode
   yarn
   yarn web
   ```

2. **Copy the built files**:
   - After building, find the `.build/web` folder
   - Copy ALL contents from `.build/web/*` to this `public/vscode/` directory
   - The structure should look like:
     ```
     public/vscode/
     ├── index.html
     ├── out/
     ├── node_modules/
     └── ... (other VS Code web files)
     ```

3. **Access the editor**:
   - Once files are copied, the editor will load at `/editor` route
   - Full VS Code interface will be embedded in ProgramBharat

## Important Notes

- The build is ~100MB+ in size
- Service workers must be properly configured
- CORS and sandbox attributes are already set in the iframe
- This directory is currently empty - you must add the VS Code build files

## Alternative

If building VS Code is too complex, the app currently uses Monaco Editor (the same editor that powers VS Code) as a lighter alternative.
