using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

public class StateContainer
{
    public string UserId { get; set; } = string.Empty;

    public void SetUserId(string userId)
    {
        UserId = userId;
    }

    public string GetUserId()
    {
        return UserId;
    }
}

