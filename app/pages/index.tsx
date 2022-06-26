import React, { useRef, useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import styles from "./Home.module.scss";

// POLISH: styling contact form
const Home = () => {
  const [isSending, setIsSending] = useState(false);
  const [response, setResponse] = useState<
    { error: string } | { success: string } | null
  >(null);

  const [robotCheckModalOpen, setRobotCheckModalOpen] = useState(false);
  const [robotChecked, setRobotChecked] = useState<"hooman">();
  const [abortController, setAbortController] = useState<AbortController>();

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Head>
        <title>Kontakt | Nydelic Invoices</title>
        <meta
          name="description"
          content={"Senden Sie uns eine Nachricht wenn Fragen auftauchen."}
        />
      </Head>

      {robotCheckModalOpen && (
        <div className={`${styles["robot-check-modal"]}`}>
          <div>
            <div className={`${styles["robot-info"]}`}>
              Bitte bestätigen Sie, dass Sie kein Roboter sind.
            </div>
            <button
              form="invoices-contact-form"
              onClick={() => {
                setRobotChecked("hooman");
              }}
              className={`${styles["robot-confirm"]}`}
            >
              → I&apos;m not a robot. ←
            </button>
          </div>
        </div>
      )}

      <form
        ref={formRef}
        id="invoices-contact-form"
        className={`${styles["contact-form"]}`}
        onSubmit={async (e) => {
          e.preventDefault();

          abortController?.abort();
          const newAbortController = new AbortController();
          setAbortController(newAbortController);

          const formData = new FormData(e.currentTarget);
          if (robotChecked !== "hooman") {
            setRobotCheckModalOpen(true);
          } else if (!isSending) {
            setRobotCheckModalOpen(false);

            formData.append(
              "name",
              `${formData.get("firstname") || ""} ${
                formData.get("lastname") || ""
              }`
            );
            formData.delete("firstname");
            formData.delete("lastname");

            setIsSending(true);
            setResponse(null);

            try {
              const res = await fetch("/api/send-mail", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(Object.fromEntries(formData)),
                signal: newAbortController.signal,
              });

              const json = await res.json();
              if (json.error) {
                setResponse({ error: json.error });
                return;
              } else if (json.message) {
                setResponse({
                  success:
                    "Email received. Please check your inbox for the confirmation",
                });

                return;
              }
              throw new Error("Something went wrong.");
            } catch (error) {
              setResponse({ error: "Sorry, but something went wrong :(" });
            } finally {
              setRobotChecked(undefined);
              setIsSending(false);
            }
          }
        }}
      >
        <h1>Kontakt</h1>
        <div className={`${styles["form-cols"]}`}>
          <label>
            Vorname
            <input
              type="text"
              name="firstname"
              required
              placeholder="Ihr Vorname"
            />
          </label>
          <label>
            Nachname
            <input
              type="text"
              name="lastname"
              required
              placeholder="Ihr Nachname"
            />
          </label>
        </div>
        <label>
          E-Mail
          <input
            type="email"
            name="email"
            required
            placeholder="Ihre E-Mail-Adresse"
          />
        </label>
        <label>
          Betreff
          <input type="subject" name="subject" placeholder="Das Thema" />
        </label>
        <label>
          Nachricht
          <textarea
            name="message"
            placeholder="Ausführliche Beschreibung"
            required
          />
        </label>
        <motion.button
          type="submit"
          value="Submit"
          className={`${styles["submit"]} ${
            isSending ? "nydelic-invoices-btn-loading" : ""
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="var(--background-color)"
          >
            <path d="M0 12l11 3.1 7-8.1-8.156 5.672-4.312-1.202 15.362-7.68-3.974 14.57-3.75-3.339-2.17 2.925v-.769l-2-.56v7.383l4.473-6.031 4.527 4.031 6-22z" />
          </svg>
        </motion.button>
        {response &&
          ("error" in response ? (
            <div
              className={`${styles["contact-response-message"]} ${styles["error"]}`}
            >
              {response.error}
            </div>
          ) : (
            <div
              className={`${styles["contact-response-message"]} ${styles["success"]}`}
            >
              {response.success}
            </div>
          ))}
      </form>
    </>
  );
};

export default Home;
