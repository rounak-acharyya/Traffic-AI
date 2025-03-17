import joblib
import pandas as pd
import sys

# Load trained model
model = joblib.load("traffic_model.pkl")

# Read input from Node.js backend
data = sys.argv[1:]  # Get input as command-line arguments
hour, month, x, y = map(float, data)  # Convert to float

# Create DataFrame
input_data = pd.DataFrame([[hour, month, x, y]], columns=['hour', 'month', 'X', 'Y'])

# Predict traffic volume
prediction = model.predict(input_data)[0]
print(prediction)  # Send output to Node.js backend
