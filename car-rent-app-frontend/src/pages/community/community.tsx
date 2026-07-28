import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import "./community.css";

// Import images to fix display issue
import smartTransportationImg from "../../assets/image.png";

type CommunityPost = {
  id: number;
  image: string;
  date: string;
  author: string;
  comments: number;
  title: string;
  excerpt: string;
  buttonText?: string;
  link: string; // link to open on continue
};

const posts: CommunityPost[] = [
  {
    id: 1,
    image: smartTransportationImg,
    date: "Dec. 29, 2024",
    author: "Admin",
    comments: 3,
    title: "Tips to rent a Self Drive Car",
    excerpt:
      "A good amount of planning and attention is required before renting a self driven car anywhere in the world. In India, it gets all the more important.",
    buttonText: "Continue ➡",
    link: "https://traveltriangle.com/blog/road-trips-in-india/",
  },
  {
    id: 2,
    image: smartTransportationImg,
    date: "Jan. 29, 2025",
    author: "Admin",
    comments: 3,
    title: "Checklist before taking & handing over a self drive car",
    excerpt:
      "Here you find a checklist in printable format. It is a good idea to adhere to this checklist before taking over a rental car.",
    buttonText: "Continue ➡",
    link: "https://traveltriangle.com/blog/road-trips-in-india/",
  },
  {
    id: 3,
    image: smartTransportationImg,
    date: "Dec. 12, 2024",
    author: "Travel Triangle",
    comments: 3,
    title: "35 Spectacular Self Drive routes in India",
    excerpt:
      "Road trips are perhaps the best way to satiate your craving for adventure and escape monotony. Here’s a list of popular road trips in India that you strongly need to take in order to get a break from monotony.",
    buttonText: "Continue ➡",
    link: "https://traveltriangle.com/blog/road-trips-in-india/",
  },
];

export default function Community() {
  const handleContinue = (link: string) => {
    window.location.href = link; // open link in same tab
  };

  return (
    <>
      <Navbar />
      <div className="community-page">
        {posts.map((post) => (
          <div key={post.id} className="community-card">
            <div className="community-image-container">
              <img
                src={post.image}
                alt={post.title}
                className="community-img"
              />
            </div>
            <div className="community-meta">
              <span>{post.date}</span>
              <span> · {post.author}</span>
              <span> · 💬 {post.comments}</span>
            </div>
            <h2 className="community-title">{post.title}</h2>
            <p className="community-excerpt">{post.excerpt}</p>
            <button
              className="community-btn"
              onClick={() => handleContinue(post.link)}
              style={{ marginTop: "16px" }}
            >
              {post.buttonText || "Continue"}
            </button>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}
