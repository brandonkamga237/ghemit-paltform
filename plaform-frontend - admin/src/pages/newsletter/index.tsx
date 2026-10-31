import { useState } from "react"
import { Badge } from "@gehmit/ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gehmit/ui/components/tabs"
import { useNewsletter } from "./use-newsletter"
import { useComposer } from "./use-composer"
import { ComposeTab } from "./compose-tab"
import { CampaignsTab, SubscribersTab } from "./lists"

/** Newsletter : rédaction, campagnes, abonnés. État dans `useNewsletter` et `useComposer`. */
export function NewsletterPage() {
  const news = useNewsletter()
  const composer = useComposer(news)
  const [tab, setTab] = useState("compose")

  return (
    <div className="flex flex-col gap-group">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">Newsletter</h1>
        <p className="text-small text-ink-muted">
          {news.activeCount} abonné(s) actif(s). Chaque e-mail emporte un lien de désinscription signé.
        </p>
      </div>
      {news.error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">{news.error}</div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="compose">Composer</TabsTrigger>
          <TabsTrigger value="campaigns">
            Campagnes
            {news.draftCount > 0 && (
              <Badge variant="secondary" className="ml-1.5">
                {news.draftCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            Abonnés
            <Badge variant="secondary" className="ml-1.5">
              {news.subscribers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-4">
          <ComposeTab composer={composer} segments={news.segments} activeCount={news.activeCount} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignsTab
            campaigns={news.campaigns}
            onCompose={() => setTab("compose")}
            onEdit={(c) => {
              composer.load(c)
              setTab("compose")
            }}
            onSend={(id) => void news.sendDraft(id)}
            onDelete={async (id) => {
              const done = await news.deleteDraft(id)
              if (done && composer.editingId === id) composer.reset()
            }}
          />
        </TabsContent>

        <TabsContent value="subscribers" className="mt-4">
          <SubscribersTab
            subscribers={news.subscribers}
            activeCount={news.activeCount}
            onRemove={(id) => void news.removeSubscriber(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
