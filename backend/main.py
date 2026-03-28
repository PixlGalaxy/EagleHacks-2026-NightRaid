from flask import Flask, jsonify, request

app = Flask("Dash")

@app.route("/1")
def example():
    pass

@app.route("/2")
def example():
    pass

@app.route("/3")
def example():
    pass

@app.route("/4")
def example():
    pass

@app.route("/5")
def example():
    pass

@app.route("/6")
def example():
    pass

if __name__ == "__main__":
    app.run(debug=True)