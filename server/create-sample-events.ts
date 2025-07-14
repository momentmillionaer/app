import { notion, findDatabaseByTitle } from "./notion";

async function createSampleEvents() {
    try {
        console.log("Creating sample events...");

        // Find the Events database
        const eventsDb = await findDatabaseByTitle("Events");
        if (!eventsDb) {
            throw new Error("Events database not found. Please run setup first.");
        }

        console.log("Found Events database:", eventsDb.id);

        const sampleEvents = [
            {
                title: "Jazz im Park",
                description: "Entspannter Jazzabend im Stadtpark mit lokalen Musikern. Bringen Sie Ihre Picknickdecke mit!",
                category: "musik",
                location: "Stadtpark Graz",
                date: "2025-07-20",
                time: "19:00",
                price: "Kostenlos",
                website: "https://www.graz.at/jazz-im-park",
                attendees: "ca. 200 Personen"
            },
            {
                title: "Improvisationstheater Workshop",
                description: "Lernen Sie die Grundlagen des Improvisationstheaters in diesem interaktiven Workshop.",
                category: "theater",
                location: "Kulturzentrum bei der Minoritenkirche",
                date: "2025-07-22",
                time: "14:00",
                price: "25€",
                website: "https://www.kulturzentrum-graz.at/impro-workshop",
                attendees: "max. 15 Personen"
            },
            {
                title: "Kunstmarkt am Hauptplatz",
                description: "Lokale Künstler präsentieren ihre Werke. Gemälde, Skulpturen und Handwerk.",
                category: "kunst",
                location: "Hauptplatz",
                date: "2025-07-25",
                time: "10:00",
                price: "Kostenlos",
                website: "https://www.graz.at/kunstmarkt",
                attendees: "ca. 500 Besucher"
            },
            {
                title: "Fußballturnier der Vereine",
                description: "Lokale Fußballvereine spielen um den Stadtpokal. Spannende Spiele garantiert!",
                category: "sport",
                location: "Sportplatz Liebenau",
                date: "2025-07-26",
                time: "09:00",
                price: "5€ Eintritt",
                website: "https://www.sport-graz.at/stadtpokal",
                attendees: "ca. 300 Zuschauer"
            },
            {
                title: "Weinverkostung in der Südsteiermark",
                description: "Probieren Sie die besten Weine der Region bei dieser geführten Verkostung.",
                category: "food",
                location: "Weingut Müller, Gamlitz",
                date: "2025-07-28",
                time: "15:00",
                price: "35€",
                website: "https://www.weingut-mueller.at/verkostung",
                attendees: "max. 25 Personen"
            },
            {
                title: "Fotografie Workshop",
                description: "Lernen Sie die Grundlagen der Straßenfotografie mit professioneller Anleitung.",
                category: "workshop",
                location: "Treffpunkt Hauptplatz",
                date: "2025-07-30",
                time: "10:00",
                price: "40€",
                website: "https://www.foto-graz.at/workshop",
                attendees: "max. 12 Personen"
            },
            {
                title: "Lange Nacht der Museen",
                description: "Besuchen Sie alle Museen der Stadt mit nur einem Ticket. Spezialführungen inklusive.",
                category: "kunst",
                location: "Verschiedene Museen",
                date: "2025-08-02",
                time: "18:00",
                price: "15€",
                website: "https://www.graz.at/lange-nacht-museen",
                attendees: "ca. 2000 Besucher"
            },
            {
                title: "Genuss Festival",
                description: "Drei Tage voller kulinarischer Highlights mit regionalen Produzenten und Köchen.",
                category: "festival",
                location: "Augarten",
                date: "2025-08-05",
                time: "11:00",
                price: "Kostenlos (Speisen kostenpflichtig)",
                website: "https://www.genuss-festival-graz.at",
                attendees: "ca. 5000 Besucher täglich"
            }
        ];

        for (const event of sampleEvents) {
            await notion.pages.create({
                parent: {
                    database_id: eventsDb.id
                },
                properties: {
                    Title: {
                        title: [
                            {
                                text: {
                                    content: event.title
                                }
                            }
                        ]
                    },
                    Description: {
                        rich_text: [
                            {
                                text: {
                                    content: event.description
                                }
                            }
                        ]
                    },
                    Category: {
                        select: {
                            name: event.category
                        }
                    },
                    Location: {
                        rich_text: [
                            {
                                text: {
                                    content: event.location
                                }
                            }
                        ]
                    },
                    Date: {
                        date: {
                            start: event.date
                        }
                    },
                    Time: {
                        rich_text: [
                            {
                                text: {
                                    content: event.time
                                }
                            }
                        ]
                    },
                    Price: {
                        rich_text: [
                            {
                                text: {
                                    content: event.price
                                }
                            }
                        ]
                    },
                    Website: {
                        url: event.website
                    },
                    Attendees: {
                        rich_text: [
                            {
                                text: {
                                    content: event.attendees
                                }
                            }
                        ]
                    }
                }
            });

            console.log(`Created event: ${event.title}`);
        }

        console.log("Sample events created successfully!");
    } catch (error) {
        console.error("Error creating sample events:", error);
        throw error;
    }
}

// Run the script
createSampleEvents().then(() => {
    console.log("Sample event creation complete!");
    process.exit(0);
}).catch(error => {
    console.error("Sample event creation failed:", error);
    process.exit(1);
});