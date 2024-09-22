import axios from "axios";
import { NextResponse } from "next/server";

async function handler() {
  try {
    const response = await axios.get("https://google.com", {
      withCredentials: false,
      headers: {
        Referer: "https://your-desired-referer.com",
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 },
    );
  }
}

export { handler as GET };
