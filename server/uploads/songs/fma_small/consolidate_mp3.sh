# This script moves all MP3 files from numbered subdirectories (001-155)
# to the parent directory, then removes the empty subdirectories.

# Directory where the numbered folders are located
# Change this if your folders are in a different location
PARENT_DIR="."

echo "Starting MP3 file consolidation process..."

# Loop through each directory from 001 to 155
for i in $(seq -f "%03g" 1 155); do
    DIR_PATH="$PARENT_DIR/$i"
    
    # Check if the directory exists
    if [ -d "$DIR_PATH" ]; then
        echo "Processing directory: $i"
        
        # Count MP3 files in the directory
        FILE_COUNT=$(find "$DIR_PATH" -name "*.mp3" | wc -l)
        echo "Found $FILE_COUNT MP3 files."
        
        # Move all MP3 files to the parent directory
        if [ $FILE_COUNT -gt 0 ]; then
            # The -n option prevents overwriting existing files with the same name
            # Remove -n if you want to overwrite
            find "$DIR_PATH" -name "*.mp3" -exec mv -n {} "$PARENT_DIR/" \;
            echo "Moved MP3 files from $i to parent directory."
        else
            echo "No MP3 files found in directory $i."
        fi
        
        # Remove the now empty directory
        rmdir "$DIR_PATH" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "Removed empty directory: $i"
        else
            echo "Warning: Directory $i not empty or cannot be removed."
            # Uncomment the following line if you want to force remove non-empty directories
            # rm -rf "$DIR_PATH"
        fi
    else
        echo "Directory $i does not exist, skipping."
    fi
done

echo "Consolidation process complete!"