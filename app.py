from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("pages/home.html")


@app.route("/about")
def about():
    return render_template("pages/about.html")


if __name__ == "__main__":
    app.run(debug=True)
