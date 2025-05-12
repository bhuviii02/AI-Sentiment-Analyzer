from flask import Flask, request, jsonify, render_template
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
analyzer = SentimentIntensityAnalyzer()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    text = request.json.get("text")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    # Get detailed sentiment scores
    scores = analyzer.polarity_scores(text)
    
    # Determine dominant sentiment with emoji
    compound = scores['compound']
    if compound >= 0.05:
        sentiment = "Positive 😊"
    elif compound <= -0.05:
        sentiment = "Negative 😠"
    else:
        sentiment = "Neutral 😐"
    
    return jsonify({
        "text": text,
        "sentiment": sentiment,
        "compound": compound,
        "scores": {
            "positive": scores['pos'],
            "negative": scores['neg'],
            "neutral": scores['neu']
        }
    })

if __name__ == "__main__":
    app.run(debug=True)