"use client";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
    Attachment,
    AttachmentPreview,
    AttachmentRemove,
    Attachments,
} from "@/components/ai-elements/attachments";

import {
   ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {CheckIcon, GlobeIcon } from "lucide-react";
import { memo, useCallback, useState, Dispatch, SetStateAction} from "react";
import { FileUIPart } from "ai";

const models = [
    {
        chef: "Gemini",
        chefSlug: "gemini",
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        providers: ["google"],
    },
    {
        chef: "Gemini",
        chefSlug: "gemini",
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        providers: ["google"],
    }
]

interface AttachmentItemsProps {
    attachment : {
        id: string;
        type: "file";
        filename?: string;
        mediaType: string;
        url: string;
    };
    onRemove: (id: string) => void
}

const AttachmentItem  = memo(({attachment, onRemove}:  AttachmentItemsProps) => {
  const handleRemove = useCallback(
    () => onRemove(attachment.id),
    [onRemove, attachment.id]
  );
  return  (
    <Attachment data={attachment} key={attachment.id} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  )
})

AttachmentItem.displayName = "AttachmentItem";

interface ModelItemProps {
    m : (typeof models)[0];
    selectedModel: string,
    onSelect: (id: string) => void
}


const ModelItem = memo(({ m, selectedModel, onSelect }: ModelItemProps) => {
  const handleSelect = useCallback(() => onSelect(m.id), [onSelect, m.id]);
  return (
    <ModelSelectorItem key={m.id} onSelect={handleSelect} value={m.id}>
      <ModelSelectorLogo provider={m.chefSlug} />
      <ModelSelectorName>{m.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        {m.providers.map((provider) => (
          <ModelSelectorLogo key={provider} provider={provider} />
        ))}
      </ModelSelectorLogoGroup>
      {selectedModel === m.id ? (
        <CheckIcon className="ml-auto size-4" />
      ) : (
        <div className="ml-auto size-4" />
      )}
    </ModelSelectorItem>
  );
})

ModelItem.displayName = "ModeItem"

const PromptInputAttachementsDisplay = () => {
    const attachments = usePromptInputAttachments();

    const handleRemove = useCallback(
        (id: string) => attachments.remove(id),
        [attachments]
    )

    if(attachments.files.length === 0) {
        return null;
    }
    return (
        <Attachments variant="inline">
            {attachments.files.map((attachment) => (
                <AttachmentItem
                    attachment={attachment}
                    key={attachment.id}
                    onRemove={handleRemove}
                />
            ))}
        </Attachments>
    )
}

interface PromptDesignProps {
    input: string,
    setInput:  Dispatch<SetStateAction<string>>;
    chatStatus: "submitted" | "streaming" | "ready" | "error",
    onSubmit: (message: {text: string, files?: FileUIPart[]}) => void

}

export const PromptDesign = ({input, setInput, chatStatus, onSubmit}: PromptDesignProps) => {
    const [model, setModel] = useState<string>(models[0].id);
    const [modelSelectorOpen, setmodelSelectorOpen]  = useState(false);
    const selectedModelData = models.find((m) => m.id === model)

    const handleModelSelect = useCallback((id: string) => {
        setModel(id);
        setmodelSelectorOpen(false)
    }, [])

    const handleSubmit = useCallback((promptMessage: PromptInputMessage) => {
        const hasText = Boolean(promptMessage.text);
        const hasAttachments = Boolean(promptMessage.files?.length);

        if(!(hasText || hasAttachments)) {
            return;
        }
        onSubmit({
            text: promptMessage.text,
            files: promptMessage.files
        })
        setInput('')
        
    }, [onSubmit, setInput])

    return (
    <div className="top-0">
      <PromptInputProvider>
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
             <PromptInputAttachementsDisplay />
                 <PromptInputBody>
                     <PromptInputTextarea 
                       value={input}
                       onInput={(e) => setInput(e.currentTarget.value)}/>
                 </PromptInputBody>
                  <PromptInputFooter>
                      <PromptInputTools>
                           <PromptInputActionMenu>
                             <PromptInputActionMenuTrigger />
                             <PromptInputActionMenuContent>
                                 <PromptInputActionAddAttachments />
                              </PromptInputActionMenuContent>
                           </PromptInputActionMenu>
                          <PromptInputButton>
                                <GlobeIcon size={16} />
                                <span>Search</span>
                           </PromptInputButton>
                            <ModelSelector
                                onOpenChange={setmodelSelectorOpen}
                                open={modelSelectorOpen}
                            >
                                <ModelSelectorTrigger asChild>
                                <PromptInputButton>
                                    {selectedModelData?.chefSlug && (
                                    <ModelSelectorLogo
                                        provider={selectedModelData.chefSlug}
                                    />
                                    )}
                                    {selectedModelData?.name && (
                                    <ModelSelectorName>
                                        {selectedModelData.name}
                                    </ModelSelectorName>
                                    )}
                                </PromptInputButton>
                                </ModelSelectorTrigger>
                               <ModelSelectorContent>
                                   <ModelSelectorInput placeholder="Search models..." />
                                   <ModelSelectorList>
                                        <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                                        {models.map((map)=> (
                                        <ModelSelectorGroup heading={map.chef} key={map.chef}>
                                            {/* {models
                                            .filter((m) => m.chef === chef)
                                            .map((m) => (
                                                <ModelItem
                                                key={m.id}
                                                m={m}
                                                onSelect={handleModelSelect}
                                                selectedModel={model}
                                                />
                                            ))}  */}
                                        </ModelSelectorGroup>
                                        ))}
                                   </ModelSelectorList>
                                 </ModelSelectorContent>
                            </ModelSelector>
                       </PromptInputTools>
                        <PromptInputSubmit status={chatStatus}/>
                   </PromptInputFooter>
           </PromptInput>
      </PromptInputProvider>
    </div>
  );
}