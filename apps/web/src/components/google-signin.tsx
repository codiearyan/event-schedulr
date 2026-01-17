import { authClient } from '@/lib/auth-client'
import {useNavigate} from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function GoogleSignIn() {

const navigate = useNavigate({from: '/'})
const handleGoogleSignIn = async ()=>{


    await authClient.signIn.social({
        provider: 'google',
    }, {
        onSuccess: ()=>{
        navigate({
                to: '/dashboard',
            })
            toast.success('Signed in successfully')
        },
        onError: (error)=>{
            console.error(error)
            toast.error(error.error.message || error.error.statusText)
        }
    })
}
  return <div>
    <Button className="bg-blue-500 text-white hover:bg-blue-600 rounded-xl  px-4" onClick={handleGoogleSignIn}>Sign in with Google</Button>
  </div>
}
